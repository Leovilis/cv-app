// components/AdminPanel/index.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Mail,
  FlaskConical,
  Brain,
  Trophy,
  AlertTriangle,
  RotateCcw,
  Menu,
  X,
} from "lucide-react";
import {
  CV,
  ESTADOS_SELECCION,
  TabType,
  ExamType,
  ExamResultado,
} from "@/lib/types";
import { TabsNav } from "./TabsNav";
import { FiltersBar } from "./FiltersBar";
import { CVCard } from "./CVCard";
import { RankingModal } from "./RankingModal";
import { QuitarProcesoModal } from "./QuitarProcesoModal";
import { HistorialModal } from "./HistorialModal";
import { DiscardModal } from "./DiscardModal";
import { ExamModal } from "./ExamModal";
import { ReferencesModal } from "./ReferencesModal";
import AdminSearchPanel from "@/components/AdminSearchPanel";

type AdminMainTab = "gestion" | "busquedas";

const getAreaPrincipal = (cv: CV) => {
  if ((cv as any).areaAsignada) {
    return (cv as any).areaAsignada;
  }
  return cv.area || "Sin área";
};

export const AdminPanel: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<AdminMainTab>("gestion");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estados existentes del panel de CVs
  const [cvs, setCvs] = useState<CV[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("todos");
  const [selectedArea, setSelectedArea] = useState("Todos");
  const [selectedFormacion, setSelectedFormacion] = useState("Todos");
  const [selectedResidencia, setSelectedResidencia] = useState("Todos");
  const [selectedPuesto, setSelectedPuesto] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [editingCV, setEditingCV] = useState<string | null>(null);
  const [schedulingCV, setSchedulingCV] = useState<string | null>(null);
  const [discardingCV, setDiscardingCV] = useState<CV | null>(null);
  const [examModal, setExamModal] = useState<{ cv: CV; tipo: ExamType } | null>(
    null,
  );
  const [referencesCV, setReferencesCV] = useState<CV | null>(null);
  const [rankingModal, setRankingModal] = useState<{
    cv: CV;
    tipo: "RRHH" | "Area Tecnica";
  } | null>(null);
  const [quitProcesoModal, setQuitProcesoModal] = useState<CV | null>(null);
  const [historialModal, setHistorialModal] = useState<CV | null>(null);

  // Cerrar menú mobile al cambiar de pestaña
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeMainTab]);

  // Función para cargar CVs
  const fetchCVs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedArea !== "Todos") params.append("area", selectedArea);
      if (selectedFormacion !== "Todos")
        params.append("formacion", selectedFormacion);
      const r = await fetch(
        `/api/cv/list${params.toString() ? "?" + params.toString() : ""}`,
      );
      const d = await r.json();
      if (r.ok) setCvs(d.cvs || []);
      else alert(d.error || "Error al cargar los CVs");
    } catch {
      alert("Error al cargar los CVs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCVs();
  }, [selectedArea, selectedFormacion]);

  // Handlers (sin cambios)
  const handleSaveRanking = async (
    cv: CV,
    tipo: "RRHH" | "Area Tecnica",
    puntuacion: number,
    notas: string,
  ) => {
    try {
      const response = await fetch("/api/cv/update-ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvId: cv.id, tipo, puntuacion, notas }),
      });
      if (response.ok) {
        setRankingModal(null);
        fetchCVs();
        alert(`Puntuación de ${tipo} guardada correctamente`);
      } else {
        const error = await response.json();
        alert(error.error || "Error al guardar la puntuación");
      }
    } catch (error) {
      alert("Error al guardar la puntuación");
    }
  };

  const handleQuitProceso = async (cv: CV, motivo: string, notas: string) => {
    try {
      const response = await fetch("/api/cv/quit-proceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvId: cv.id, motivo, notas }),
      });
      if (response.ok) {
        setQuitProcesoModal(null);
        fetchCVs();
        alert("Candidato removido del proceso");
      } else {
        const error = await response.json();
        alert(error.error || "Error al quitar del proceso");
      }
    } catch (error) {
      alert("Error al quitar del proceso");
    }
  };

  const handleDownload = async (cv: CV) => {
    try {
      const r = await fetch(`/api/cv/download?id=${cv.id}`);
      const d = await r.json();
      if (r.ok) window.open(d.downloadUrl, "_blank");
      else alert(d.error || "Error al descargar");
    } catch {
      alert("Error al descargar el CV");
    }
  };

  const handleDelete = async (cv: CV) => {
    if (!confirm(`¿Eliminar el CV de ${cv.nombre} ${cv.apellido}?`)) return;
    try {
      const r = await fetch(`/api/cv/delete?id=${cv.id}`, { method: "DELETE" });
      const d = await r.json();
      if (r.ok) {
        alert("CV eliminado");
        fetchCVs();
      } else alert(d.error || "Error al eliminar");
    } catch {
      alert("Error al eliminar el CV");
    }
  };

  const handleStartSelection = (cvId: string) => {
    setEditingCV(cvId);
    setSchedulingCV(null);
  };
  const handleCancelSelection = () => setEditingCV(null);

  const handleSaveSelection = async (
    cvId: string,
    data: { puesto: string; estado: string; notas: string; area?: string },
  ) => {
    if (!data.puesto.trim()) {
      alert("Debe ingresar el puesto");
      return;
    }
    try {
      const r = await fetch("/api/cv/update-selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvId,
          puestoSeleccionado: data.puesto,
          estadoSeleccion: data.estado,
          notasAdmin: data.notas,
          areaAsignada: data.area || "",
        }),
      });
      const d = await r.json();
      if (r.ok) {
        setEditingCV(null);
        fetchCVs();
      } else alert(d.error || "Error al guardar");
    } catch {
      alert("Error al guardar");
    }
  };

  const handleDiscard = async (cv: CV, motivo: string, notas: string) => {
    try {
      const r = await fetch("/api/cv/update-selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvId: cv.id,
          puestoSeleccionado: cv.puestoSeleccionado || "",
          estadoSeleccion: "Descartado",
          notasAdmin: notas || "",
          motivoDescarte: motivo,
        }),
      });
      if (r.ok) {
        setDiscardingCV(null);
        fetchCVs();
      } else {
        const d = await r.json();
        alert(d.error || "Error");
      }
    } catch {
      alert("Error al descartar");
    }
  };

  const handleReactivar = async (cv: CV) => {
    if (!confirm(`¿Reactivar a ${cv.nombre} ${cv.apellido}?`)) return;
    try {
      const r = await fetch("/api/cv/update-selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvId: cv.id, accion: "reactivar" }),
      });
      if (r.ok) fetchCVs();
    } catch {
      alert("Error al reactivar");
    }
  };

  const handleSaveExam = async (
    cv: CV,
    tipo: ExamType,
    notas: string,
    fecha: string,
    resultado: ExamResultado,
  ) => {
    const field = tipo === "fisico" ? "examenFisico" : "examenPsicotecnico";
    const fieldFecha =
      tipo === "fisico" ? "examenFisicoFecha" : "examenPsicotecnicoFecha";
    const fieldNotas =
      tipo === "fisico" ? "examenFisicoNotas" : "examenPsicotecnicoNotas";
    const fieldResultado =
      tipo === "fisico"
        ? "examenFisicoResultado"
        : "examenPsicotecnicoResultado";
    const fechaISO = fecha
      ? new Date(fecha + "T00:00:00").toISOString()
      : new Date().toISOString();
    try {
      const r = await fetch("/api/cv/update-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvId: cv.id,
          [field]: true,
          [fieldFecha]: fechaISO,
          [fieldNotas]: notas,
          [fieldResultado]: resultado,
        }),
      });
      if (r.ok) {
        setExamModal(null);
        fetchCVs();
      } else {
        const d = await r.json();
        alert(d.error || "Error al guardar examen");
      }
    } catch {
      alert("Error al guardar examen");
    }
  };

  const handleCancelarExamen = async (cv: CV, tipo: ExamType) => {
    const field = tipo === "fisico" ? "examenFisico" : "examenPsicotecnico";
    const fieldFecha =
      tipo === "fisico" ? "examenFisicoFecha" : "examenPsicotecnicoFecha";
    const fieldNotas =
      tipo === "fisico" ? "examenFisicoNotas" : "examenPsicotecnicoNotas";
    const fieldResultado =
      tipo === "fisico"
        ? "examenFisicoResultado"
        : "examenPsicotecnicoResultado";
    try {
      const r = await fetch("/api/cv/update-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvId: cv.id,
          [field]: false,
          [fieldFecha]: null,
          [fieldNotas]: "",
          [fieldResultado]: "",
        }),
      });
      if (r.ok) {
        setExamModal(null);
        fetchCVs();
      } else {
        const d = await r.json();
        alert(d.error || "Error al cancelar examen");
      }
    } catch {
      alert("Error al cancelar examen");
    }
  };

  const handleSaveReferencias = async (cvId: string, texto: string) => {
    try {
      const r = await fetch("/api/cv/update-selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvId, referenciasLaborales: texto }),
      });
      if (r.ok) fetchCVs();
      else {
        const d = await r.json();
        alert(d.error || "Error al guardar referencias");
      }
    } catch {
      alert("Error al guardar referencias");
    }
  };

  const handleSendMail = (cv: CV) => {
    const email = cv.email || cv.uploadedBy;
    if (!email) {
      alert("No hay email registrado para este candidato.");
      return;
    }
    const subject = encodeURIComponent(
      `Proceso de selección — ${cv.puestoSeleccionado || "Manzur Administraciones"}`,
    );
    const body = encodeURIComponent(
      `Estimado/a ${cv.nombre} ${cv.apellido},\n\n`,
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  };

  // Filtros y cálculos para CVs
  const base = (list: CV[]) =>
    list.filter((cv) => {
      if (selectedArea !== "Todos" && cv.area !== selectedArea) return false;
      if (
        selectedFormacion !== "Todos" &&
        cv.nivelFormacion !== selectedFormacion
      )
        return false;
      if (
        selectedResidencia !== "Todos" &&
        cv.lugarResidencia !== selectedResidencia
      )
        return false;
      return true;
    });

  const lugaresResidencia = useMemo(() => {
    const lugares = new Set<string>();
    cvs.forEach((cv) => {
      if (cv.lugarResidencia) lugares.add(cv.lugarResidencia);
    });
    return ["Todos", ...Array.from(lugares).sort()];
  }, [cvs]);

  const allCvs = base(
    cvs.filter(
      (cv) =>
        !cv.puestoSeleccionado &&
        cv.estadoSeleccion !== "Descartado" &&
        cv.estadoSeleccion !== "Quitado del Proceso",
    ),
  );
  const entRRHH = base(
    cvs.filter((cv) => cv.estadoSeleccion === "Entrevista RRHH"),
  );
  const entAreaTecnica = base(
    cvs.filter((cv) => cv.estadoSeleccion === "Entrevista Área Técnica"),
  );
  const terna = base(
    cvs.filter((cv) => cv.estadoSeleccion === "Terna Preseleccionados"),
  );
  const seleccionados = base(
    cvs.filter((cv) => cv.estadoSeleccion === "Seleccionado"),
  );
  const descartados = base(
    cvs.filter(
      (cv) =>
        cv.estadoSeleccion === "Descartado" ||
        cv.estadoSeleccion === "Quitado del Proceso",
    ),
  );

  const cvsSinFiltroPuesto =
    activeTab === "todos"
      ? allCvs
      : activeTab === "entrevistaRRHH"
        ? entRRHH
        : activeTab === "entrevistaAreaTecnica"
          ? entAreaTecnica
          : activeTab === "terna"
            ? terna
            : activeTab === "seleccionados"
              ? seleccionados
              : descartados;

  const puestosDisponibles =
    activeTab !== "todos"
      ? Array.from(
          new Set(
            cvsSinFiltroPuesto
              .map((cv) => cv.puestoSeleccionado || cv.subArea || "")
              .filter(Boolean),
          ),
        ).sort()
      : [];

  const displayCvs =
    activeTab !== "todos" && selectedPuesto !== "Todos"
      ? cvsSinFiltroPuesto.filter(
          (cv) =>
            (cv.puestoSeleccionado || cv.subArea || "") === selectedPuesto,
        )
      : cvsSinFiltroPuesto;

  const groupedCvs = displayCvs.reduce(
    (acc, cv) => {
      const area = cv.area || "Genérico";
      if (!acc[area]) acc[area] = [];
      acc[area].push(cv);
      return acc;
    },
    {} as Record<string, CV[]>,
  );

  const tabs = [
    {
      id: "todos" as TabType,
      label: "Todos los CVs",
      count: allCvs.length,
      accent: "border-manzur-primary",
      active: "text-manzur-primary",
    },
    {
      id: "entrevistaRRHH" as TabType,
      label: "Entrevista RRHH",
      count: entRRHH.length,
      accent: "border-blue-500",
      active: "text-blue-600",
    },
    {
      id: "entrevistaAreaTecnica" as TabType,
      label: "Entrevista Área Técnica",
      count: entAreaTecnica.length,
      accent: "border-purple-500",
      active: "text-purple-600",
    },
    {
      id: "terna" as TabType,
      label: "Terna Preseleccionados",
      count: terna.length,
      accent: "border-amber-500",
      active: "text-amber-600",
    },
    {
      id: "seleccionados" as TabType,
      label: "Seleccionados",
      count: seleccionados.length,
      accent: "border-green-500",
      active: "text-green-600",
    },
    {
      id: "descartados" as TabType,
      label: "Descartados / No Aptos",
      count: descartados.length,
      accent: "border-red-500",
      active: "text-red-600",
    },
  ];

  // Extraer el nav a una variable para evitar duplicación - VERSIÓN MOBILE RESPONSIVE
  const mainTabsNav = (
    <div className="border-b-2 border-gray-200">
      {/* Desktop tabs */}
      <div className="hidden sm:flex">
        <button
          onClick={() => setActiveMainTab("gestion")}
          className={`px-4 sm:px-6 py-3 font-semibold text-sm transition-colors ${
            activeMainTab === "gestion"
              ? "border-b-2 border-manzur-primary text-manzur-primary"
              : "text-gray-500 hover:text-manzur-primary"
          }`}
        >
          Gestión de Talentos
        </button>
        <button
          onClick={() => setActiveMainTab("busquedas")}
          className={`px-4 sm:px-6 py-3 font-semibold text-sm transition-colors ${
            activeMainTab === "busquedas"
              ? "border-b-2 border-manzur-primary text-manzur-primary"
              : "text-gray-500 hover:text-manzur-primary"
          }`}
        >
          Búsquedas Activas
        </button>
      </div>

      {/* Mobile tabs - select dropdown */}
      <div className="sm:hidden p-3">
        <div className="relative">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700"
          >
            <span className="flex items-center gap-2">
              {activeMainTab === "gestion"
                ? "📋 Gestión de Talentos"
                : "🔍 Búsquedas Activas"}
            </span>
            {mobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>

          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
              <button
                onClick={() => setActiveMainTab("gestion")}
                className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                  activeMainTab === "gestion"
                    ? "bg-manzur-primary/10 text-manzur-primary font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                📋 Gestión de Talentos
              </button>
              <button
                onClick={() => setActiveMainTab("busquedas")}
                className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                  activeMainTab === "busquedas"
                    ? "bg-manzur-primary/10 text-manzur-primary font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                🔍 Búsquedas Activas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Renderizado único
  return (
    <div className="space-y-4 sm:space-y-6">
      {mainTabsNav}

      {activeMainTab === "busquedas" ? (
        <div className="px-2 sm:px-0">
          <AdminSearchPanel />
        </div>
      ) : (
        <>
          {/* Modales */}
          {discardingCV && (
            <DiscardModal
              cv={discardingCV}
              onConfirm={(m, n) => handleDiscard(discardingCV, m, n)}
              onCancel={() => setDiscardingCV(null)}
            />
          )}
          {examModal && (
            <ExamModal
              cv={examModal.cv}
              tipo={examModal.tipo}
              onConfirm={(n, f, res) =>
                handleSaveExam(examModal.cv, examModal.tipo, n, f, res)
              }
              onCancel={() => setExamModal(null)}
              onCancelarExamen={() =>
                handleCancelarExamen(examModal.cv, examModal.tipo)
              }
            />
          )}
          {referencesCV && (
            <ReferencesModal
              cv={referencesCV}
              onSave={async (texto) => {
                await handleSaveReferencias(referencesCV.id!, texto);
              }}
              onClose={() => setReferencesCV(null)}
            />
          )}
          {rankingModal && (
            <RankingModal
              cv={rankingModal.cv}
              tipo={rankingModal.tipo}
              onConfirm={(p, n) =>
                handleSaveRanking(rankingModal.cv, rankingModal.tipo, p, n)
              }
              onCancel={() => setRankingModal(null)}
            />
          )}
          {quitProcesoModal && (
            <QuitarProcesoModal
              cv={quitProcesoModal}
              onConfirm={(m, n) => handleQuitProceso(quitProcesoModal, m, n)}
              onCancel={() => setQuitProcesoModal(null)}
            />
          )}
          {historialModal && (
            <HistorialModal
              cv={historialModal}
              onClose={() => setHistorialModal(null)}
            />
          )}

          {/* Pestañas de estados de CV - responsive */}
          <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
            <TabsNav
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setSelectedPuesto("Todos");
              }}
            />
          </div>

          {/* Banners contextuales - responsive */}
          <div className="px-2 sm:px-0">
            {activeTab === "entrevistaRRHH" && (
              <p className="text-xs sm:text-sm text-blue-700 bg-blue-50 px-3 sm:px-4 py-2 rounded-lg border border-blue-200">
                Candidatos en entrevista con RRHH. Usá{" "}
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline" /> para
                agendar. También podés puntuar al candidato con{" "}
                <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline" />.
              </p>
            )}
            {activeTab === "entrevistaAreaTecnica" && (
              <p className="text-xs sm:text-sm text-purple-700 bg-purple-50 px-3 sm:px-4 py-2 rounded-lg border border-purple-200">
                Candidatos en entrevista con Área Técnica. Agendá, puntuá y
                avanzalos a <strong>Terna Preseleccionados</strong>.
              </p>
            )}
            {activeTab === "terna" && (
              <p className="text-xs sm:text-sm text-amber-700 bg-amber-50 px-3 sm:px-4 py-2 rounded-lg border border-amber-200">
                Terna de candidatos. Podés enviarles{" "}
                <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline" /> mail,
                solicitar{" "}
                <FlaskConical className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mx-0.5 sm:mx-1 text-blue-600" />{" "}
                examen físico o{" "}
                <Brain className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mx-0.5 sm:mx-1 text-green-600" />{" "}
                psicotécnico.
              </p>
            )}
            {activeTab === "seleccionados" && (
              <p className="text-xs sm:text-sm text-green-700 bg-green-50 px-3 sm:px-4 py-2 rounded-lg border border-green-200">
                <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-1" />
                Candidatos que ingresaron a la empresa.
              </p>
            )}
            {activeTab === "descartados" && (
              <p className="text-xs sm:text-sm text-red-700 bg-red-50 px-3 sm:px-4 py-2 rounded-lg border border-red-200">
                <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-1" />
                Candidatos No Aptos o Quitados del Proceso. Usá{" "}
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline" />{" "}
                <strong>Reactivar</strong> para devolverlos.
              </p>
            )}
          </div>

          {/* Filtros - responsive */}
          <div className="px-2 sm:px-0">
            <FiltersBar
              activeTab={activeTab}
              selectedArea={selectedArea}
              onAreaChange={(area) => {
                setSelectedArea(area);
                setSelectedPuesto("Todos");
              }}
              selectedFormacion={selectedFormacion}
              onFormacionChange={setSelectedFormacion}
              selectedResidencia={selectedResidencia}
              onResidenciaChange={setSelectedResidencia}
              selectedPuesto={selectedPuesto}
              onPuestoChange={setSelectedPuesto}
              puestosDisponibles={puestosDisponibles}
              lugaresResidencia={lugaresResidencia}
              onRefresh={fetchCVs}
            />
          </div>

          <div className="text-xs sm:text-sm text-manzur-primary px-2 sm:px-0">
            Total: {displayCvs.length} CV{displayCvs.length !== 1 ? "s" : ""}
          </div>

          {loading ? (
            <p className="text-center text-gray-500 py-8">Cargando...</p>
          ) : displayCvs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay CVs disponibles
            </p>
          ) : activeTab === "terna" ? (
            // ==================== TERNA: ORDENADO POR PROMEDIO ====================
            (() => {
              // Calcular promedio y área principal para cada CV
              const cvsConDatos = displayCvs.map((cv) => {
                const puntRRHH = (cv as any).puntuacionRRHH || 0;
                const puntAT = (cv as any).puntuacionAreaTecnica || 0;
                const promedio = (puntRRHH + puntAT) / 2;
                const areaPrincipal = getAreaPrincipal(cv);
                return { ...cv, promedioTerna: promedio, areaPrincipal };
              });

              // Ordenar: primero por área, luego por promedio descendente
              const cvsOrdenados = [...cvsConDatos].sort((a, b) => {
                if (a.areaPrincipal !== b.areaPrincipal) {
                  return a.areaPrincipal.localeCompare(b.areaPrincipal);
                }
                return (b.promedioTerna || 0) - (a.promedioTerna || 0);
              });

              // Agrupar por área principal
              const grupos: Record<string, CV[]> = {};
              cvsOrdenados.forEach((cv) => {
                if (!grupos[cv.areaPrincipal]) grupos[cv.areaPrincipal] = [];
                grupos[cv.areaPrincipal].push(cv);
              });

              return Object.entries(grupos).map(([area, areaCvs]) => (
                <div key={area} className="mb-8">
                  <h3 className="text-lg font-bold mb-3 pb-2 border-b-2 border-amber-300 text-amber-800 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    {area}
                    <span className="ml-1 text-sm font-normal text-amber-600">
                      ({areaCvs.length} candidato
                      {areaCvs.length !== 1 ? "s" : ""})
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {areaCvs.map((cv, idx) => (
                      <div key={cv.id} className="flex items-stretch gap-3">
                        {/* Columna de ranking */}
                        <div className="flex flex-col items-center justify-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 min-w-[70px]">
                          <span className="text-xs text-gray-500">Puesto</span>
                          <span className="text-xl font-black text-amber-700">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-amber-600">
                            {(cv.promedioTerna || 0).toFixed(1)}
                          </span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                              <span
                                key={s}
                                className={`text-[10px] ${s <= Math.round(cv.promedioTerna || 0) ? "text-yellow-500" : "text-gray-300"}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        {/* CV Card */}
                        <div className="flex-1 min-w-0">
                          <CVCard
                            key={cv.id}
                            cv={cv}
                            activeTab={activeTab}
                            editingCV={editingCV}
                            schedulingCV={schedulingCV}
                            onStartSelection={handleStartSelection}
                            onCancelSelection={handleCancelSelection}
                            onSaveSelection={handleSaveSelection}
                            onSchedule={setSchedulingCV}
                            onDownload={handleDownload}
                            onDelete={handleDelete}
                            onDiscard={setDiscardingCV}
                            onReactivar={handleReactivar}
                            onSendMail={handleSendMail}
                            onExam={(cv, tipo) => setExamModal({ cv, tipo })}
                            onReferences={setReferencesCV}
                            onRanking={(cv, tipo) =>
                              setRankingModal({ cv, tipo })
                            }
                            onQuitProceso={setQuitProcesoModal}
                            onHistorial={setHistorialModal}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()
          ) : (
            Object.entries(groupedCvs).map(([area, areaCvs]) => (
              <div key={area} className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 pb-2 border-b-2 border-manzur-secondary text-manzur-primary px-2 sm:px-0">
                  {area} ({areaCvs.length})
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {areaCvs.map((cv) => (
                    <CVCard
                      key={cv.id}
                      cv={cv}
                      activeTab={activeTab}
                      editingCV={editingCV}
                      schedulingCV={schedulingCV}
                      onStartSelection={handleStartSelection}
                      onCancelSelection={handleCancelSelection}
                      onSaveSelection={handleSaveSelection}
                      onSchedule={setSchedulingCV}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                      onDiscard={setDiscardingCV}
                      onReactivar={handleReactivar}
                      onSendMail={handleSendMail}
                      onExam={(cv, tipo) => setExamModal({ cv, tipo })}
                      onReferences={setReferencesCV}
                      onRanking={(cv, tipo) => setRankingModal({ cv, tipo })}
                      onQuitProceso={setQuitProcesoModal}
                      onHistorial={setHistorialModal}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};
