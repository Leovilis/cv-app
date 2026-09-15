// pages/api/cv/migrate-areas.ts
// ⚠️ Endpoint de uso único. Eliminar una vez ejecutado.
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getFirestore } from '@/lib/firebase-admin';

// Mapa: valor actual en Firestore → nombre normalizado (debe coincidir exactamente con el ABM)
const AREA_MAP: Record<string, string> = {
  'AUDITORIA':                    'Auditoría Bebidas',
  'COMPRAS':                      'Compras',
  'CONTABLE':                     'Contable',
  'CONTROL DE GESTION':           'Control de Gestión',
  'COORDINACION GENERAL':         'Coordinación General',
  'DATA ANALYTICS':               'Data Analytics',
  'Data Analytics':               'Data Analytics',
  'DISTRIBUIDORA':                'Distribuidora',
  'FINANZAS':                     'Finanzas',
  'GESTION DE CALIDAD':           'Gestión de Calidad',
  'GESTION DOCUMENTAL':           'Gestión Documental',
  'Genérico':                     'Genérico',
  'HOTELERIA, GASTRONOMIA Y TURISMO': 'Hotelería, Gastronomía y Turismo',
  'IMPUESTOS':                    'Impuestos',
  'INDUSTRIA LACTEA':             'Industria Láctea',
  'MAESTRANZA':                   'Maestranza',
  'MARKETING':                    'Marketing',
  'PLANIFICACION ESTRATEGICA':    'Planificación Estratégica',
  'RRHH HARD':                    'RRHH Hard',
  'RRHH Hard y Soft':             'RRHH Hard',
  'RRHH SOFT':                    'RRHH Soft',
  'RSE':                          'RSE',
  'SISTEMAS':                     'Sistemas',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || session.user.email !== process.env.ADMIN_EMAIL)
    return res.status(403).json({ error: 'Acceso denegado' });

  try {
    const db = getFirestore();
    const snapshot = await db.collection('cvs').get();

    const resultados: any[] = [];
    let actualizados = 0;
    let sinCambio = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const areaActual = data.area || '';
      const areaNueva = AREA_MAP[areaActual];

      if (!areaNueva) {
        resultados.push({ id: doc.id, area: areaActual, resultado: 'sin mapeo' });
        continue;
      }

      if (areaNueva === areaActual) {
        sinCambio++;
        continue;
      }

      await db.collection('cvs').doc(doc.id).update({ area: areaNueva });
      resultados.push({ id: doc.id, de: areaActual, a: areaNueva });
      actualizados++;
    }

    return res.status(200).json({
      success: true,
      total:       snapshot.size,
      actualizados,
      sinCambio,
      sinMapeo:    resultados.filter(r => r.resultado === 'sin mapeo'),
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}