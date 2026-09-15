// pages/api/cv/migrate-residencia.ts
// ⚠️ Endpoint de uso único. Eliminar una vez ejecutado.
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getFirestore } from '@/lib/firebase-admin';

// Mapeo manual para casos conocidos que georef no puede resolver
const MANUAL_MAP: Record<string, { provincia: string; departamento: string }> = {
  // Salta Capital (múltiples variantes)
  'salta capital':              { provincia: 'Salta', departamento: 'Capital' },
  'salta - capital':            { provincia: 'Salta', departamento: 'Capital' },
  'salta, capital':             { provincia: 'Salta', departamento: 'Capital' },
  'salta capital ':             { provincia: 'Salta', departamento: 'Capital' },
  'salta,capital':              { provincia: 'Salta', departamento: 'Capital' },
  'sala capital':               { provincia: 'Salta', departamento: 'Capital' },
  // Tartagal (variantes con provincia)
  'tartagal - salta':           { provincia: 'Salta', departamento: 'General José de San Martín' },
  'tartagal-salta':             { provincia: 'Salta', departamento: 'General José de San Martín' },
  'tartagal salta':             { provincia: 'Salta', departamento: 'General José de San Martín' },
  'tartagal,salta':             { provincia: 'Salta', departamento: 'General José de San Martín' },
  'tartagal salta ':            { provincia: 'Salta', departamento: 'General José de San Martín' },
  'tartagal-salta ':            { provincia: 'Salta', departamento: 'General José de San Martín' },
  'general san martín (tartagal)': { provincia: 'Salta', departamento: 'General José de San Martín' },
  'general san martin (tartagal)': { provincia: 'Salta', departamento: 'General José de San Martín' },
  'tartagal ':                  { provincia: 'Salta', departamento: 'General José de San Martín' },
  'tartagal salta  ':           { provincia: 'Salta', departamento: 'General José de San Martín' },
  'tartagal salta   ':          { provincia: 'Salta', departamento: 'General José de San Martín' },
  // Palpalá
  'palpalá - jujuy':            { provincia: 'Jujuy', departamento: 'Palpalá' },
  'palpalá, jujuy':             { provincia: 'Jujuy', departamento: 'Palpalá' },
  'palpala - jujuy':            { provincia: 'Jujuy', departamento: 'Palpalá' },
  // San Salvador de Jujuy con extras
  'san salvador de jujuy, jujuy, argentina': { provincia: 'Jujuy', departamento: 'Dr. Manuel Belgrano' },
  'san salvador de jujuy, jujuy':            { provincia: 'Jujuy', departamento: 'Dr. Manuel Belgrano' },
  'san salvador de jujuy, argentina':        { provincia: 'Jujuy', departamento: 'Dr. Manuel Belgrano' },
  'san salvador de jujuy / libertador general san martín': { provincia: 'Jujuy', departamento: 'Dr. Manuel Belgrano' },
  'san salvador-jujuy ':        { provincia: 'Jujuy', departamento: 'Dr. Manuel Belgrano' },
  // Perico
  'perico, jujuy':              { provincia: 'Jujuy', departamento: 'El Carmen' },
  'perico jujuy':               { provincia: 'Jujuy', departamento: 'El Carmen' },
  'jujuy perico ':              { provincia: 'Jujuy', departamento: 'El Carmen' },
  // El Carmen
  'el carmen, jujuy':           { provincia: 'Jujuy', departamento: 'El Carmen' },
  'el carmen, jujuy ':          { provincia: 'Jujuy', departamento: 'El Carmen' },
  // Humahuaca
  'humahuaca, jujuy':           { provincia: 'Jujuy', departamento: 'Humahuaca' },
  'humahuaca, huacalera, jujuy':{ provincia: 'Jujuy', departamento: 'Humahuaca' },
  'tilcara - jujuy':            { provincia: 'Jujuy', departamento: 'Tilcara' },
  'tilcara jujuy':              { provincia: 'Jujuy', departamento: 'Tilcara' },
  'tilcara jujuy ':             { provincia: 'Jujuy', departamento: 'Tilcara' },
  'tilcara  jujuy':             { provincia: 'Jujuy', departamento: 'Tilcara' },
  // Metán
  'metan salta':                { provincia: 'Salta', departamento: 'Metán' },
  'metan salta ':               { provincia: 'Salta', departamento: 'Metán' },
  'san jose de metan _ salta':  { provincia: 'Salta', departamento: 'Metán' },
  // Cerrillos
  'cerrillos,salta':            { provincia: 'Salta', departamento: 'Cerrillos' },
  'cerrillos, salta':           { provincia: 'Salta', departamento: 'Cerrillos' },
  // Alto Comedero (barrio de SSJ)
  'alto comedero':              { provincia: 'Jujuy', departamento: 'Dr. Manuel Belgrano' },
  // General Enrique Mosconi
  'general enrique mosconi':    { provincia: 'Salta', departamento: 'General José de San Martín' },
  // Lozano (localidad de SSJ)
  'lozano, jujuy':              { provincia: 'Jujuy', departamento: 'Dr. Manuel Belgrano' },
  // Santa Clara
  'santa clara, jujuy':         { provincia: 'Jujuy', departamento: 'Santa Bárbara' },
  // CABA
  'caba':                       { provincia: 'Ciudad Autónoma de Buenos Aires', departamento: 'Ciudad Autónoma de Buenos Aires' },
  'capital federal - buenos aires': { provincia: 'Ciudad Autónoma de Buenos Aires', departamento: 'Ciudad Autónoma de Buenos Aires' },
  // Apolinario Saravia
  'apolinario saravia salta ':  { provincia: 'Salta', departamento: 'Anta' },
  'apolinario saravia-anta-salta ': { provincia: 'Salta', departamento: 'Anta' },
  // Campo Quijano
  'campo quijano, salta, argentina': { provincia: 'Salta', departamento: 'Rosario de Lerma' },
  // Joaquín V. González
  'joaquin v gonzalez - anta - salta ': { provincia: 'Salta', departamento: 'Anta' },
  // San Pablo de Reyes
  'san pablo de reyes':         { provincia: 'Jujuy', departamento: 'Tilcara' },
  // Salta y Jujuy (doble)
  'salta y jujuy':              { provincia: 'Jujuy', departamento: 'Dr. Manuel Belgrano' },
  // Tartagal - Salta con guión
  'tartagal - salta ':          { provincia: 'Salta', departamento: 'General José de San Martín' },
  // La Merced
  'b° el portal san agustín - la merced - salta ': { provincia: 'Salta', departamento: 'La Caldera' },
  // Las Toscas
  'las toscas, santa fe':       { provincia: 'Santa Fe', departamento: 'General Obligado' },
  // Mendoza Guaymallen
  'mendoza, guaymallen':        { provincia: 'Mendoza', departamento: 'Guaymallén' },
  // San Francisco de Álava / Santa Victoria
  'san francisco de álava ( santa victoria) san salvador de jujuy': { provincia: 'Salta', departamento: 'Santa Victoria' },
  // Tartagal salta sin tilde
  // Bolivia / Lima Perú — extranjeros, asignar sin provincia
  'bolivia':                    { provincia: 'Extranjero', departamento: 'Bolivia' },
  'lima periu':                 { provincia: 'Extranjero', departamento: 'Perú' },
  // Códigos postales
  '1_4403':                     { provincia: 'Jujuy', departamento: 'Dr. Manuel Belgrano' },
  '4512':                       { provincia: 'Jujuy', departamento: 'Dr. Manuel Belgrano' },
  // Cuyaya (barrio de SSJ)
  'dr. baldi 1879 - cuyaya':    { provincia: 'Jujuy', departamento: 'Dr. Manuel Belgrano' },
};

async function resolveGeoref(texto: string): Promise<{ provincia: string; departamento: string } | null> {
  if (!texto?.trim()) return null;
  const limpio = texto.trim().toLowerCase();

  // 1. Buscar en mapa manual (normalizado a lowercase)
  const manualKey = Object.keys(MANUAL_MAP).find(k => k.toLowerCase() === limpio);
  if (manualKey) return MANUAL_MAP[manualKey];

  // 2. Limpiar el texto: extraer primer token antes de separadores
  const primerToken = texto
    .split(/[-,\/|+]|(\s+y\s+)|(\s+salta\s*$)|(\s+jujuy\s*$)|(\s+argentina\s*$)/i)[0]
    .trim();

  // 3. Intentar municipio con primer token
  try {
    const r1 = await fetch(
      `https://apis.datos.gob.ar/georef/api/municipios?nombre=${encodeURIComponent(primerToken)}&campos=nombre,provincia.nombre&max=1`
    );
    const d1 = await r1.json();
    const m = d1.municipios?.[0];
    if (m) return { provincia: m.provincia.nombre, departamento: m.nombre };

    // 4. Departamento
    const r2 = await fetch(
      `https://apis.datos.gob.ar/georef/api/departamentos?nombre=${encodeURIComponent(primerToken)}&campos=nombre,provincia.nombre&max=1`
    );
    const d2 = await r2.json();
    const dep = d2.departamentos?.[0];
    if (dep) return { provincia: dep.provincia.nombre, departamento: dep.nombre };

    // 5. Provincia
    const r3 = await fetch(
      `https://apis.datos.gob.ar/georef/api/provincias?nombre=${encodeURIComponent(primerToken)}&campos=nombre&max=1`
    );
    const d3 = await r3.json();
    const prov = d3.provincias?.[0];
    if (prov) return { provincia: prov.nombre, departamento: '' };
  } catch { /* continuar */ }

  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || session.user.email !== process.env.ADMIN_EMAIL)
    return res.status(403).json({ error: 'Acceso denegado' });

  try {
    const db = getFirestore();
    const snapshot = await db.collection('cvs').get();

    const sinProvincia = snapshot.docs.filter(doc => {
      const d = doc.data();
      return (!d.provincia || d.provincia === '') && d.lugarResidencia;
    });

    console.log(`📦 Total CVs: ${snapshot.size} | A migrar: ${sinProvincia.length}`);

    if (sinProvincia.length === 0) {
      return res.status(200).json({ success: true, message: 'Nada para migrar', total: 0 });
    }

    const resultados: any[] = [];

    for (const doc of sinProvincia) {
      const data  = doc.data();
      const texto = data.lugarResidencia || '';
      const geo   = await resolveGeoref(texto);

      if (geo) {
        await db.collection('cvs').doc(doc.id).update({
          provincia:    geo.provincia,
          departamento: geo.departamento || '',
        });
        resultados.push({ id: doc.id, lugarResidencia: texto, ok: true, ...geo });
        console.log(`  ✅ "${texto}" → ${geo.departamento}, ${geo.provincia}`);
      } else {
        resultados.push({ id: doc.id, lugarResidencia: texto, ok: false });
        console.warn(`  ⚠️ No resuelto: "${texto}"`);
      }

      await new Promise(r => setTimeout(r, 200));
    }

    const ok   = resultados.filter(r => r.ok).length;
    const fail = resultados.filter(r => !r.ok);

    return res.status(200).json({ success: true, total: sinProvincia.length, ok, fail });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}