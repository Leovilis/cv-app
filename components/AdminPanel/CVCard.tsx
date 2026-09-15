// components/AdminPanel/CVCard.tsx
import React, { useState, useEffect } from "react";
import {
  Download,
  Trash2,
  UserCheck,
  Calendar,
  ArrowLeftCircle,
  AlertTriangle,
  Trophy,
  ThumbsDown,
  RotateCcw,
  History,
  Mail,
  FlaskConical,
  Brain,
  FileText,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Bookmark,
} from "lucide-react";
import { CV } from "@/lib/types";
import { EXAM_BADGE, RESULTADO_CONFIG } from "@/lib/constants";
import { CVCardProps } from "./types";
import { InterviewScheduler } from "./InterviewScheduler";
import { SelectionEditor } from "./SelectionEditor";

const getAreaPrincipal = (cv: CV) => {
  if ((cv as any).areaAsignada) return (cv as any).areaAsignada;
  if (cv.busquedasInfo?.[0]?.area) return cv.busquedasInfo[0].area;
  return cv.area || "Sin área";
};

const getPuestoAplicacion = (cv: CV) => {
  // Si tiene puesto seleccionado por admin, mostrarlo como "Asignado"
  if (cv.puestoSeleccionado) {
    return { texto: cv.puestoSeleccionado, tipo: "asignado" };
  }
  // Si viene de búsqueda activa, mostrar el puesto de la búsqueda
  if (
    cv.busquedasInfo?.[0]?.puesto
  ) {
    return { texto: cv.busquedasInfo[0].puesto!, tipo: "busqueda" };
  }
  // Si es postulación manual
  if (cv.subArea) {
    return { texto: cv.subArea, tipo: "manual" };
  }
  return { texto: "No especificado", tipo: "ninguno" };
};

const getAreaAplicacion = (cv: CV) => {
  // Si tiene área asignada por admin
  if ((cv as any).areaAsignada) {
    return { texto: (cv as any).areaAsignada, tipo: "asignado" };
  }
  // Si viene de búsqueda activa
  if (
    cv.busquedasInfo?.[0]?.area
  ) {
    return { texto: cv.busquedasInfo[0].area!, tipo: "busqueda" };
  }
  // Si es postulación manual
  if (cv.area) {
    return { texto: cv.area, tipo: "manual" };
  }
  return { texto: "Sin área", tipo: "ninguno" };
};

export const CVCard: React.FC<CVCardProps> = ({
  cv,
  activeTab,
  editingCV,
  schedulingCV,
  onStartSelection,
  onCancelSelection,
  onSaveSelection,
  onSchedule,
  onDownload,
  onDelete,
  onDiscard,
  onReactivar,
  onSendMail,
  onExam,
  onReferences,
  onRanking,
  onQuitProceso,
  onHistorial,
  onRegistrarRevision,
}) => {
  const isEditing = editingCV === cv.id;
  const isScheduling = schedulingCV === cv.id;
  const isDiscarded =
    cv.estadoSeleccion === "Descartado" ||
    cv.estadoSeleccion === "Quitado del Proceso";
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const isInterviewTab =
    activeTab === "entrevistaRRHH" || activeTab === "entrevistaAreaTecnica";
  const isTerna = activeTab === "terna";
  const isRRHHTab = activeTab === "entrevistaRRHH";
  const isAreaTecnicaTab = activeTab === "entrevistaAreaTecnica";

  const areaMostrada = getAreaPrincipal(cv);

  const formatFecha = (fecha: string | undefined) => {
    if (!fecha) return "No registrada";
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleRegistrarRevision = async () => {
    if (onRegistrarRevision) {
      await onRegistrarRevision(cv.id!);
    }
  };

  const handleSendSemetraMail = () => {
    const empresa = "";
    const sucursal = "";
    const nombreCompleto = `${cv.nombre} ${cv.apellido}`;
    const dni = cv.dni;
    const puesto = cv.puestoSeleccionado || cv.subArea || "No especificado";
    const fechaEPO =
      new Date().toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) + " - 8:00";

    const destinatarios =
      "horacio.murillo@semetrasrl.com.ar, recepcion@semetrasrl.com.ar";
    const asunto = `Solicitud Examen Preocupacional - Manzur Administraciones - ${nombreCompleto}`;

    const cuerpo = `Estimados, buenos días

Solicito un turno para examen preocupacional de ley, para el día ${fechaEPO}; para:

      EMPRESA:              ${(empresa || "(completar)").padEnd(46)} 
      SUCURSAL:           ${(sucursal || "(completar)").padEnd(46)}
      NOMBRE:               ${nombreCompleto.padEnd(46)}             
      DNI:                          ${dni.padEnd(46)}                        
      PUESTO:                ${puesto.padEnd(46)}                     
      FECHA EPO:         ${fechaEPO.padEnd(46)}                   
 

Aguardo confirmación

Desde ya muchas gracias. Saludos!`;

    const mailtoLink = `mailto:${destinatarios}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    window.open(mailtoLink, "_blank");
  };

  const badgeBg =
    cv.estadoSeleccion === "Descartado" ||
    cv.estadoSeleccion === "Quitado del Proceso"
      ? "bg-red-50 border-red-300"
      : cv.estadoSeleccion === "Seleccionado"
        ? "bg-green-50 border-green-300"
        : cv.estadoSeleccion === "Terna Preseleccionados"
          ? "bg-amber-50 border-amber-300"
          : cv.estadoSeleccion === "Entrevista Área Técnica"
            ? "bg-purple-50 border-purple-300"
            : cv.estadoSeleccion === "Entrevista RRHH"
              ? "bg-blue-50 border-blue-300"
              : "bg-gray-50 border-gray-200";

  const badgeTxt =
    cv.estadoSeleccion === "Descartado" ||
    cv.estadoSeleccion === "Quitado del Proceso"
      ? "text-red-900"
      : cv.estadoSeleccion === "Seleccionado"
        ? "text-green-900"
        : cv.estadoSeleccion === "Terna Preseleccionados"
          ? "text-amber-900"
          : cv.estadoSeleccion === "Entrevista Área Técnica"
            ? "text-purple-900"
            : cv.estadoSeleccion === "Entrevista RRHH"
              ? "text-blue-900"
              : "text-gray-900";

  const schedulerLabel =
    activeTab === "entrevistaRRHH"
      ? "Entrevista RRHH"
      : "Entrevista Área Técnica";
  const tienePuntuacionRRHH = (cv as any).puntuacionRRHH;
  const tienePuntuacionArea = (cv as any).puntuacionAreaTecnica;

  const getAvailableEstados = () => {
    if (activeTab === "todos") return ["En Curso", "Entrevista RRHH"];
    if (activeTab === "entrevistaRRHH")
      return ["Entrevista RRHH", "Entrevista Área Técnica"];
    if (activeTab === "entrevistaAreaTecnica")
      return ["Entrevista Área Técnica", "Terna Preseleccionados"];
    if (activeTab === "terna")
      return ["Terna Preseleccionados", "Seleccionado"];
    if (activeTab === "seleccionados") return ["Seleccionado"];
    return [];
  };

  const ExamBadges = () => {
    const hasFisico = cv.examenFisico;
    const hasPsi = cv.examenPsicotecnico;
    if (!hasFisico && !hasPsi) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {hasFisico && (
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-semibold ${EXAM_BADGE.fisico.bg} ${EXAM_BADGE.fisico.border} ${EXAM_BADGE.fisico.text}`}
          >
            <FlaskConical className="w-3 h-3" />
            <span className="hidden sm:inline">{EXAM_BADGE.fisico.label}</span>
            {cv.examenFisicoFecha && (
              <span className="font-normal opacity-75 text-xs">
                {formatFecha(cv.examenFisicoFecha)}
              </span>
            )}
          </div>
        )}
        {hasPsi && (
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-semibold ${EXAM_BADGE.psicotecnico.bg} ${EXAM_BADGE.psicotecnico.border} ${EXAM_BADGE.psicotecnico.text}`}
          >
            <Brain className="w-3 h-3" />
            <span className="hidden sm:inline">
              {EXAM_BADGE.psicotecnico.label}
            </span>
            {cv.examenPsicotecnicoFecha && (
              <span className="font-normal opacity-75 text-xs">
                {formatFecha(cv.examenPsicotecnicoFecha)}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`border rounded-lg hover:shadow-md transition-shadow ${isDiscarded ? "border-red-300 bg-red-50/30" : "border-manzur-secondary"}`}
    >
      {isDiscarded && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-t-lg text-xs sm:text-sm font-semibold">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">
            CANDIDATO NO APTO —{" "}
            {cv.motivoDescarte ||
              (cv as any).motivoQuitadoProceso ||
              "Descartado del proceso"}
          </span>
        </div>
      )}

      {cv.repostulacionDescartado && !isDiscarded && (
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-t-lg text-xs sm:text-sm font-semibold flex-wrap">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>ATENCIÓN: Descartado anteriormente</span>
          <span className="text-xs opacity-90 truncate">
            {cv.motivoDescarteAnterior || "Sin motivo"}
          </span>
        </div>
      )}

      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-base sm:text-lg truncate">
                {cv.nombre} {cv.apellido}
              </p>
              {cv.revisado && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300 flex-shrink-0">
                  ✓ Revisado
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              {tienePuntuacionRRHH && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                  <Trophy className="w-3 h-3" /> RRHH: {tienePuntuacionRRHH}/10
                </span>
              )}
              {tienePuntuacionArea && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                  <Trophy className="w-3 h-3" /> AT: {tienePuntuacionArea}/10
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowFullDetails(!showFullDetails)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {showFullDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Información básica */}
        <div>
          <div className="block gap-x-3 gap-y-1 mt-3 text-xs sm:text-sm text-gray-600">
            <p className="truncate">
              <span className="font-medium">DNI:</span> {cv.dni}
            </p>
            <p className="truncate">
              <span className="font-medium">Tel:</span> ({cv.telefonoArea}){" "}
              {cv.telefonoNumero}
            </p>
            {(cv.departamento || cv.provincia || cv.lugarResidencia) && (
              <p className="truncate">
                <span className="font-medium">📍</span>{" "}
                {cv.departamento && cv.provincia
                  ? `${cv.departamento}, ${cv.provincia}`
                  : cv.lugarResidencia || cv.provincia || cv.departamento}
              </p>
            )}

            {/* Área y puesto de aplicación */}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-1">
                📋 Postulación:
              </p>
              <div className="space-y-0.5">
                <p className="truncate">
                  <span className="font-medium">Área:</span>{" "}
                  {cv.areaAsignada ? (
                    <span className="text-green-600">
                      {cv.areaAsignada}{" "}
                      <span className="text-xs">(asignada)</span>
                    </span>
                  ) : cv.busquedasInfo?.[0]?.area ? (
                    <span className="text-amber-600">
                      {cv.busquedasInfo[0].area}{" "}
                      <span className="text-xs">(búsqueda activa)</span>
                    </span>
                  ) : cv.area ? (
                    <span>{cv.area}</span>
                  ) : (
                    <span className="text-gray-400">No especificada</span>
                  )}
                </p>
                <p className="truncate">
                  <span className="font-medium">Puesto:</span>{" "}
                  {cv.puestoSeleccionado ? (
                    <span className="text-green-600">
                      {cv.puestoSeleccionado}{" "}
                      <span className="text-xs">(asignado)</span>
                    </span>
                  ) : cv.busquedasInfo?.[0]?.puesto ? (
                    <span className="text-amber-600">
                      {cv.busquedasInfo[0].puesto}{" "}
                      <span className="text-xs">(búsqueda activa)</span>
                    </span>
                  ) : cv.subArea ? (
                    <span>{cv.subArea}</span>
                  ) : (
                    <span className="text-gray-400">No especificado</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {(showFullDetails || isDesktop) && (
          <div className="mt-3 space-y-3">
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2">
                📅 Fechas clave
              </p>
              <div className="block sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <span>📄 Carga:</span>
                  <span className="font-medium text-gray-700">
                    {formatFecha(cv.uploadedAt)}
                  </span>
                </div>

                {cv.fechaUltimaRevision && (
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-base">👁️ Revisión:</span>
                    <span className="font-medium text-green-600">
                      {formatFecha(cv.fechaUltimaRevision)}
                    </span>
                    {cv.revisadoPor && (
                      <span className="text-xs text-gray-400">
                        por {cv.revisadoPor}
                      </span>
                    )}
                  </div>
                )}

                {(cv as any).fechaEntrevistaRRHH && (
                  <div className="flex items-center gap-1">
                    <span>🎯 RRHH:</span>
                    <span className="font-medium text-blue-600">
                      {formatFecha((cv as any).fechaEntrevistaRRHH)}
                    </span>
                  </div>
                )}

                {(cv as any).fechaEntrevistaAreaTecnica && (
                  <div className="flex items-center gap-1">
                    <span>🔬 AT:</span>
                    <span className="font-medium text-purple-600">
                      {formatFecha((cv as any).fechaEntrevistaAreaTecnica)}
                    </span>
                  </div>
                )}

                {cv.estadoSeleccion === "Descartado" && cv.fechaSeleccion && (
                  <div className="flex items-center gap-1">
                    <span>❌ Descarte:</span>
                    <span className="font-medium text-red-600">
                      {formatFecha(cv.fechaSeleccion)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {cv.puestoSeleccionado && (
              <div className={`p-2 sm:p-3 rounded-lg border ${badgeBg}`}>
                <p className="font-semibold text-sm sm:text-base">
                  {cv.puestoSeleccionado}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm">
                  <span className="text-gray-600">
                    Área: <span className="font-medium">{areaMostrada}</span>
                  </span>
                  <span className="text-gray-600">
                    Estado:{" "}
                    <span className={`font-semibold ${badgeTxt}`}>
                      {cv.estadoSeleccion || "En Curso"}
                    </span>
                  </span>
                </div>
                {cv.notasAdmin && (
                  <p className="text-xs text-gray-500 mt-2 pt-1 border-t border-gray-200">
                    📝 {cv.notasAdmin}
                  </p>
                )}
              </div>
            )}

            <ExamBadges />
          </div>
        )}

        {/* Botones */}
        <div className="mt-4 overflow-x-auto pb-2 -mx-3 px-3">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => onHistorial(cv)}
              title="Trazabilidad"
              className="px-2 sm:px-3 py-2 text-white text-sm rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
            >
              <History className="w-4 h-4" />
            </button>

            {isRRHHTab && (
              <button
                onClick={() => onRanking(cv, "RRHH")}
                title="Puntuar RRHH"
                className={`px-2 sm:px-3 py-2 text-sm rounded-lg transition-colors ${tienePuntuacionRRHH ? "bg-amber-100 border-amber-400 text-amber-800" : "bg-amber-500 hover:bg-amber-600 text-white"}`}
              >
                <Trophy className="w-4 h-4" />
              </button>
            )}

            {isAreaTecnicaTab && (
              <button
                onClick={() => onRanking(cv, "Area Tecnica")}
                title="Puntuar AT"
                className={`px-2 sm:px-3 py-2 text-sm rounded-lg transition-colors ${tienePuntuacionArea ? "bg-purple-100 border-purple-400 text-purple-800" : "bg-purple-500 hover:bg-purple-600 text-white"}`}
              >
                <Trophy className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => {
                handleRegistrarRevision();
                onDownload(cv);
              }}
              title="Descargar CV"
              className="px-2 sm:px-3 py-2 text-white text-sm rounded-lg bg-manzur-primary hover:bg-manzur-secondary transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {isRRHHTab && (
              <button
                onClick={() => {
                  handleRegistrarRevision();
                  onReferences(cv);
                }}
                title="Referencias"
                className={`px-2 sm:px-3 py-2 text-sm rounded-lg border-2 ${cv.referenciasLaborales ? "bg-blue-100 border-blue-400 text-blue-800" : "bg-white border-blue-300 text-blue-600"}`}
              >
                <FileText className="w-4 h-4" />
              </button>
            )}

            {isInterviewTab && (
              <button
                onClick={() => {
                  handleRegistrarRevision();
                  onSchedule(isScheduling ? null : cv.id!);
                }}
                title="Agendar"
                className={`px-2 sm:px-3 py-2 text-white text-sm rounded-lg ${isScheduling ? "bg-purple-800" : "bg-purple-600 hover:bg-purple-700"}`}
              >
                <Calendar className="w-4 h-4" />
              </button>
            )}

            {isTerna && (
              <>
                <button
                  onClick={handleSendSemetraMail}
                  title="Solicitar Examen Preocupacional a Semetra"
                  className="px-2 sm:px-3 py-2 text-white text-sm rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors"
                >
                  <Bookmark className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    handleRegistrarRevision();
                    onExam(cv, "fisico");
                  }}
                  title="Ex. Físico"
                  className={`px-2 sm:px-3 py-2 text-sm rounded-lg border-2 ${cv.examenFisico ? "bg-blue-100 border-blue-400 text-blue-800" : "bg-white border-blue-300 text-blue-600"}`}
                >
                  <FlaskConical className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    handleRegistrarRevision();
                    onExam(cv, "psicotecnico");
                  }}
                  title="Ex. Psicotécnico"
                  className={`px-2 sm:px-3 py-2 text-sm rounded-lg border-2 ${cv.examenPsicotecnico ? "bg-green-100 border-green-400 text-green-800" : "bg-white border-green-300 text-green-600"}`}
                >
                  <Brain className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    handleRegistrarRevision();
                    onSendMail(cv);
                  }}
                  title="Email"
                  className="px-2 sm:px-3 py-2 text-white text-sm rounded-lg bg-sky-500 hover:bg-sky-600"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </>
            )}

            {activeTab !== "seleccionados" && (
              <button
                onClick={() => {
                  handleRegistrarRevision();
                  onSchedule(null);
                  onStartSelection(cv.id!);
                }}
                title="Gestionar"
                className="px-2 sm:px-3 py-2 text-white text-sm rounded-lg bg-green-600 hover:bg-green-700"
              >
                <UserCheck className="w-4 h-4" />
              </button>
            )}

            {(activeTab === "entrevistaRRHH" ||
              activeTab === "entrevistaAreaTecnica" ||
              activeTab === "terna" ||
              activeTab === "seleccionados") && (
              <button
                onClick={() => onDiscard(cv)}
                title="Descartar"
                className="px-2 sm:px-3 py-2 text-white text-sm rounded-lg bg-red-500 hover:bg-red-600"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            )}

            {activeTab !== "todos" && activeTab !== "descartados" && (
              <button
                onClick={() => onQuitProceso(cv)}
                title="Quitar"
                className="px-2 sm:px-3 py-2 text-white text-sm rounded-lg bg-orange-500 hover:bg-orange-600"
              >
                <ArrowLeftCircle className="w-4 h-4" />
              </button>
            )}

            {activeTab === "descartados" && (
              <button
                onClick={() => onReactivar(cv)}
                title="Reactivar"
                className="px-2 sm:px-3 py-2 text-white text-sm rounded-lg bg-amber-500 hover:bg-amber-600"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onDelete(cv)}
              title="Eliminar"
              className="px-2 sm:px-3 py-2 text-white text-sm rounded-lg bg-gray-500 hover:bg-gray-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isScheduling && isInterviewTab && (
        <InterviewScheduler
          cv={cv}
          label={schedulerLabel}
          onClose={() => onSchedule(null)}
        />
      )}

      {isEditing && (
        <SelectionEditor
          cv={cv}
          availableEstados={getAvailableEstados()}
          onSave={(data) => onSaveSelection(cv.id!, data)}
          onCancel={onCancelSelection}
        />
      )}
    </div>
  );
};