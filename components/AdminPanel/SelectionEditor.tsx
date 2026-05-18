// components/AdminPanel/SelectionEditor.tsx
import React, { useState } from "react";
import { Check, X, Info, Briefcase } from "lucide-react";
import { AREAS, AREAS_PUESTOS } from "@/lib/types";
import { CV } from "@/lib/types";

interface SelectionEditorProps {
  cv: CV;
  availableEstados: string[];
  onSave: (data: {
    puesto: string;
    estado: string;
    notas: string;
    area: string;
  }) => void;
  onCancel: () => void;
}

export const SelectionEditor: React.FC<SelectionEditorProps> = ({
  cv,
  availableEstados,
  onSave,
  onCancel,
}) => {
  // Obtener información de la búsqueda activa seleccionada (si existe)
  const busquedaInfo =
    cv.busquedasInfo && cv.busquedasInfo.length > 0
      ? cv.busquedasInfo[0]
      : null;
  const vieneDeBusquedaActiva =
    busquedaInfo !== null && !cv.area && !cv.subArea;

  // Obtener el área y puesto según el origen
  let areaOriginal = "";
  let puestoOriginal = "";

  if (vieneDeBusquedaActiva) {
    // Viene de búsqueda activa - mostrar el puesto de la búsqueda
    areaOriginal = busquedaInfo.area || "";
    puestoOriginal = busquedaInfo.puesto || "";
  } else {
    // Viene de selección manual
    areaOriginal = cv.area || "";
    puestoOriginal = cv.subArea || "";
  }

  // Determinar el área inicial (si tiene asignación previa del admin, usarla)
  const areaInicial = (cv as any).areaAsignada || "";

  const puestosIniciales = cv.puestoSeleccionado
    ? cv.puestoSeleccionado
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  const [areaSelec, setAreaSelec] = useState(areaInicial);
  const [puestosSelec, setPuestosSelec] = useState<string[]>(puestosIniciales);
  const [estado, setEstado] = useState(
    cv.estadoSeleccion || availableEstados[0] || "En Curso",
  );
  const [notas, setNotas] = useState(cv.notasAdmin || "");

  const puestosDeArea = areaSelec ? AREAS_PUESTOS[areaSelec] || [] : [];

  const togglePuesto = (p: string) =>
    setPuestosSelec((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );

  const handleAreaChange = (nuevaArea: string) => {
    setAreaSelec(nuevaArea);
    setPuestosSelec([]);
  };

  return (
    <div className="p-4 border-t border-manzur-secondary bg-gray-50">
      <h4 className="font-medium text-manzur-primary mb-3">
        Gestionar Proceso de Selección
      </h4>

      {/* Mostrar información de la postulación original del candidato */}
      {(areaOriginal || puestoOriginal) && (
        <div
          className="mb-4 p-3 rounded-lg border"
          style={{
            backgroundColor: vieneDeBusquedaActiva ? "#fef3c7" : "#dbeafe",
            borderColor: vieneDeBusquedaActiva ? "#f59e0b" : "#3b82f6",
          }}
        >
          <div className="flex items-start gap-2">
            <Briefcase
              className="w-4 h-4 flex-shrink-0"
              style={{
                color: vieneDeBusquedaActiva ? "#d97706" : "#2563eb",
              }}
            />
            <div className="text-sm flex-1">
              <p
                className="font-medium"
                style={{
                  color: vieneDeBusquedaActiva ? "#92400e" : "#1e40af",
                }}
              >
                {vieneDeBusquedaActiva
                  ? "📌 Postulación vía búsqueda activa:"
                  : "📋 Postulación manual:"}
              </p>
              <p
                style={{
                  color: vieneDeBusquedaActiva ? "#78350f" : "#1e3a8a",
                }}
              >
                <span className="font-medium">Área:</span> {areaOriginal} |
                <span className="font-medium ml-2">Puesto:</span>{" "}
                {puestoOriginal}
              </p>
              {vieneDeBusquedaActiva && busquedaInfo?.titulo && (
                <p className="text-xs mt-1" style={{ color: "#78350f" }}>
                  <span className="font-medium">Búsqueda:</span>{" "}
                  {busquedaInfo.titulo}
                </p>
              )}
              <p className="text-xs mt-1 opacity-75">
                El admin puede asignar un área/puesto diferente si lo requiere
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {/* Área - NO obligatorio */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Área (opcional)
          </label>
          <select
            value={areaSelec}
            onChange={(e) => handleAreaChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">-- Sin asignar --</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Si el candidato viene de una búsqueda activa, puede dejar vacío
          </p>
        </div>

        {/* Puestos - NO obligatorio */}
        {areaSelec && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Puesto/s (opcional)
              {puestosSelec.length > 0 && (
                <span className="ml-2 text-xs font-normal text-green-700 bg-green-100 border border-green-300 rounded-full px-2 py-0.5">
                  {puestosSelec.length} seleccionado
                  {puestosSelec.length !== 1 ? "s" : ""}
                </span>
              )}
            </label>
            <div className="border border-gray-200 rounded-lg bg-white max-h-48 overflow-y-auto divide-y divide-gray-100">
              {puestosDeArea.map((p) => (
                <label
                  key={p}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${puestosSelec.includes(p) ? "bg-green-50" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={puestosSelec.includes(p)}
                    onChange={() => togglePuesto(p)}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                  <span
                    className={`text-sm ${puestosSelec.includes(p) ? "font-semibold text-green-800" : "text-gray-700"}`}
                  >
                    {p}
                    {puestoOriginal === p && (
                      <span className="ml-2 text-xs text-blue-500">
                        (postulado)
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {availableEstados.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Notas (opcional)
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Observaciones sobre el candidato..."
          />
        </div>

        {/* Botones */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              onSave({
                puesto: puestosSelec.join(", "),
                estado,
                notas,
                area: areaSelec,
              });
            }}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4" />
            Guardar
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
