"use client"

import { useState, useEffect } from "react"
import { SimpleAuth } from "../components/auth/simple-auth"
import { QuickSetup } from "../components/onboarding/quick-setup"
import { MacroCalculator } from "../components/macro-calculator"
import { WorkoutRoutines } from "../components/workout-routines"
import { MeditationCenter } from "../components/meditation-center"
import {
  getCurrentUser,
  getProfile,
  getTodayProgress,
  getUserStreaks,
  getDailyTip,
  getSupplementPromotions,
  trackPromotionInteraction,
  updateTodayProgress,
  updateStreak,
} from "../lib/supabase"

export default function Home() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [activeSection, setActiveSection] = useState("inicio")
  const [adminClicks, setAdminClicks] = useState(0)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [adminCode, setAdminCode] = useState("")
  const [todayProgress, setTodayProgress] = useState(null)
  const [streaks, setStreaks] = useState([])
  const [dailyTip, setDailyTip] = useState(null)
  const [promotions, setPromotions] = useState([])

  useEffect(() => {
    checkAuthState()
  }, [])

  useEffect(() => {
    if (user && profile && !needsOnboarding) {
      loadUserData()
    }
  }, [user, profile, needsOnboarding])

  const checkAuthState = async () => {
    const currentUser = await getCurrentUser()
    if (currentUser) {
      const { data: userProfile } = await getProfile(currentUser.id)
      if (userProfile) {
        setUser(currentUser)
        setProfile(userProfile)
        // Verificar si necesita onboarding
        if (!userProfile.age || !userProfile.weight || !userProfile.height) {
          setNeedsOnboarding(true)
        }
      }
    }
  }

  const loadUserData = async () => {
    if (!user) return

    // Cargar progreso de hoy
    const { data: progress } = await getTodayProgress(user.id)
    setTodayProgress(progress)

    // Cargar rachas
    const { data: userStreaks } = await getUserStreaks(user.id)
    setStreaks(userStreaks || [])

    // Cargar tip diario
    const { data: tip } = await getDailyTip()
    setDailyTip(tip)

    // Cargar promociones relevantes
    const { data: promos } = await getSupplementPromotions(profile?.physical_goals)
    setPromotions(promos || [])
  }

  const handleAuthSuccess = (authUser: any, userProfile: any) => {
    setUser(authUser)
    setProfile(userProfile)
    if (!userProfile || !userProfile.age) {
      setNeedsOnboarding(true)
    }
  }

  const handleOnboardingComplete = (completedProfile: any) => {
    setProfile(completedProfile)
    setNeedsOnboarding(false)
  }

  const handleLogoClick = () => {
    setAdminClicks((prev) => prev + 1)
    if (adminClicks >= 4) {
      setShowAdminPanel(true)
      setAdminClicks(0)
    }
    setTimeout(() => setAdminClicks(0), 2000)
  }

  const handleAdminAccess = () => {
    if (adminCode === "1098648820") {
      setActiveSection("admin")
      setShowAdminPanel(false)
      setAdminCode("")
    } else {
      alert("Código incorrecto")
    }
  }

  const handleActivityComplete = async (activityType: "nutrition" | "exercise" | "meditation") => {
    if (!user) return

    // Actualizar progreso
    const updates: any = {}
    if (activityType === "nutrition") updates.calories_consumed = (todayProgress?.calories_consumed || 0) + 100
    if (activityType === "exercise") updates.workout_completed = true
    if (activityType === "meditation") updates.meditation_completed = true

    await updateTodayProgress(user.id, updates)
    await updateStreak(user.id, activityType)

    // Recargar datos
    loadUserData()
  }

  const handlePromotionClick = async (promotionId: string, link: string) => {
    if (user) {
      await trackPromotionInteraction(user.id, promotionId, "click")
    }
    window.open(link, "_blank")
  }

  // Si no está autenticado
  if (!user) {
    return <SimpleAuth onAuthSuccess={handleAuthSuccess} />
  }

  // Si necesita onboarding
  if (needsOnboarding) {
    return <QuickSetup user={user} onComplete={handleOnboardingComplete} />
  }

  const renderContent = () => {
    switch (activeSection) {
      case "alimentacion":
        return (
          <div style={{ padding: "2rem" }}>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                marginBottom: "2rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textAlign: "center",
              }}
            >
              🥗 Alimentación Inteligente
            </h1>
            <MacroCalculator />
            <div className="mt-6">
              <button
                onClick={() => handleActivityComplete("nutrition")}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
              >
                ✅ Registrar comida completada
              </button>
            </div>
          </div>
        )

      case "movimiento":
        return (
          <div style={{ padding: "2rem" }}>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                marginBottom: "2rem",
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textAlign: "center",
              }}
            >
              💪 Movimiento y Ejercicio
            </h1>
            <WorkoutRoutines />
            <div className="mt-6">
              <button
                onClick={() => handleActivityComplete("exercise")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
              >
                ✅ Marcar ejercicio completado
              </button>
            </div>
          </div>
        )

      case "mentalidad":
        return (
          <div style={{ padding: "2rem" }}>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                marginBottom: "2rem",
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textAlign: "center",
              }}
            >
              🧠 Mentalidad y Bienestar
            </h1>
            <MeditationCenter />
            <div className="mt-6">
              <button
                onClick={() => handleActivityComplete("meditation")}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold"
              >
                ✅ Marcar meditación completada
              </button>
            </div>
          </div>
        )

      case "premium":
        return (
          <div style={{ padding: "2rem" }}>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                marginBottom: "2rem",
                background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textAlign: "center",
              }}
            >
              ⭐ VitalMente Premium
            </h1>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "2rem",
                maxWidth: "1200px",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "20px",
                  padding: "2rem",
                  color: "white",
                  textAlign: "center",
                }}
              >
                <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Plan Básico</h3>
                <div style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}>$9.99</div>
                <div style={{ marginBottom: "2rem" }}>por mes</div>
                <ul style={{ textAlign: "left", marginBottom: "2rem" }}>
                  <li>✅ Calculadora de macros avanzada</li>
                  <li>✅ 20+ rutinas de ejercicio</li>
                  <li>✅ Meditaciones guiadas</li>
                  <li>✅ Seguimiento básico</li>
                </ul>
                <button
                  style={{
                    background: "white",
                    color: "#667eea",
                    border: "none",
                    borderRadius: "10px",
                    padding: "1rem 2rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Comenzar Prueba Gratis
                </button>
              </div>

              <div
                style={{
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  borderRadius: "20px",
                  padding: "2rem",
                  color: "white",
                  textAlign: "center",
                  transform: "scale(1.05)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "20px",
                    padding: "0.5rem 1rem",
                    marginBottom: "1rem",
                    display: "inline-block",
                  }}
                >
                  MÁS POPULAR
                </div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Plan Pro</h3>
                <div style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}>$19.99</div>
                <div style={{ marginBottom: "2rem" }}>por mes</div>
                <ul style={{ textAlign: "left", marginBottom: "2rem" }}>
                  <li>✅ Todo del Plan Básico</li>
                  <li>✅ Planes de comida personalizados</li>
                  <li>✅ Rutinas adaptativas</li>
                  <li>✅ Coach virtual 24/7</li>
                  <li>✅ Análisis avanzado</li>
                  <li>✅ Comunidad exclusiva</li>
                </ul>
                <button
                  style={{
                    background: "white",
                    color: "#f5576c",
                    border: "none",
                    borderRadius: "10px",
                    padding: "1rem 2rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Comenzar Ahora
                </button>
              </div>

              <div
                style={{
                  background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  borderRadius: "20px",
                  padding: "2rem",
                  color: "white",
                  textAlign: "center",
                }}
              >
                <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Plan Elite</h3>
                <div style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}>$39.99</div>
                <div style={{ marginBottom: "2rem" }}>por mes</div>
                <ul style={{ textAlign: "left", marginBottom: "2rem" }}>
                  <li>✅ Todo del Plan Pro</li>
                  <li>✅ Consultas 1:1 con expertos</li>
                  <li>✅ Planes completamente personalizados</li>
                  <li>✅ Acceso a suplementos premium</li>
                  <li>✅ Soporte prioritario</li>
                </ul>
                <button
                  style={{
                    background: "white",
                    color: "#00f2fe",
                    border: "none",
                    borderRadius: "10px",
                    padding: "1rem 2rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Contactar Ventas
                </button>
              </div>
            </div>
          </div>
        )

      case "admin":
        return (
          <div style={{ padding: "2rem" }}>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                marginBottom: "2rem",
                background: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textAlign: "center",
              }}
            >
              🔧 Panel de Administración
            </h1>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "2rem",
                maxWidth: "1200px",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "15px",
                  padding: "2rem",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  border: "1px solid #e0e0e0",
                }}
              >
                <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#333" }}>
                  📊 Analytics
                </h3>
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>1,247</div>
                  <div style={{ color: "#666" }}>Usuarios activos</div>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f5576c" }}>89</div>
                  <div style={{ color: "#666" }}>Suscripciones Premium</div>
                </div>
                <div>
                  <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#4facfe" }}>$2,847</div>
                  <div style={{ color: "#666" }}>Ingresos este mes</div>
                </div>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: "15px",
                  padding: "2rem",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  border: "1px solid #e0e0e0",
                }}
              >
                <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#333" }}>
                  👥 Gestión de Usuarios
                </h3>
                <button
                  style={{
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.75rem 1.5rem",
                    marginBottom: "1rem",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Ver Todos los Usuarios
                </button>
                <button
                  style={{
                    background: "#f5576c",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.75rem 1.5rem",
                    marginBottom: "1rem",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Usuarios Premium
                </button>
                <button
                  style={{
                    background: "#4facfe",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.75rem 1.5rem",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Reportes de Actividad
                </button>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: "15px",
                  padding: "2rem",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  border: "1px solid #e0e0e0",
                }}
              >
                <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#333" }}>
                  🍽️ Gestión de Contenido
                </h3>
                <button
                  style={{
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.75rem 1.5rem",
                    marginBottom: "1rem",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Agregar Recetas
                </button>
                <button
                  style={{
                    background: "#f5576c",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.75rem 1.5rem",
                    marginBottom: "1rem",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Gestionar Rutinas
                </button>
                <button
                  style={{
                    background: "#4facfe",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.75rem 1.5rem",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Meditaciones
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div>
            {/* Dashboard personalizado */}
            <section style={{ padding: "2rem", background: "#f8f9fa" }}>
              <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem", color: "#333" }}>
                  ¡Hola {profile?.full_name}! 👋
                </h2>

                {/* Rachas */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                    marginBottom: "2rem",
                  }}
                >
                  {streaks.map((streak: any) => (
                    <div
                      key={streak.streak_type}
                      style={{
                        background: "white",
                        borderRadius: "15px",
                        padding: "1.5rem",
                        textAlign: "center",
                        boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                        {streak.streak_type === "nutrition" ? "🥗" : streak.streak_type === "exercise" ? "💪" : "🧠"}
                      </div>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" }}>
                        {streak.current_streak}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#666" }}>días seguidos</div>
                    </div>
                  ))}
                </div>

                {/* Tip diario */}
                {dailyTip && (
                  <div
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: "15px",
                      padding: "2rem",
                      color: "white",
                      marginBottom: "2rem",
                    }}
                  >
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem" }}>💡 Tip del día</h3>
                    <h4 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>{dailyTip.title}</h4>
                    <p style={{ opacity: 0.9 }}>{dailyTip.content}</p>
                  </div>
                )}

                {/* Promociones de suplementos */}
                {promotions.length > 0 && (
                  <div style={{ marginBottom: "2rem" }}>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#333" }}>
                      💊 Recomendado para ti
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      {promotions.map((promo: any) => (
                        <div
                          key={promo.id}
                          style={{
                            background: "white",
                            borderRadius: "15px",
                            padding: "1.5rem",
                            boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                          }}
                        >
                          <h4 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                            {promo.name}
                          </h4>
                          <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1rem" }}>{promo.description}</p>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#f5576c" }}>
                                ${promo.price}
                              </span>
                              {promo.discount_percentage > 0 && (
                                <span
                                  style={{
                                    fontSize: "0.8rem",
                                    background: "#ff4757",
                                    color: "white",
                                    padding: "0.2rem 0.5rem",
                                    borderRadius: "10px",
                                    marginLeft: "0.5rem",
                                  }}
                                >
                                  -{promo.discount_percentage}%
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handlePromotionClick(promo.id, promo.affiliate_link)}
                              style={{
                                background: "#667eea",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                padding: "0.5rem 1rem",
                                cursor: "pointer",
                              }}
                            >
                              Ver oferta
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Hero Section */}
            <section
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "4rem 2rem",
                textAlign: "center",
              }}
            >
              <h1
                style={{
                  fontSize: "3.5rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                Transforma tu vida con VitalMente
              </h1>
              <p
                style={{
                  fontSize: "1.25rem",
                  marginBottom: "2rem",
                  opacity: 0.9,
                  maxWidth: "600px",
                  margin: "0 auto 2rem auto",
                }}
              >
                La plataforma integral que combina alimentación inteligente, movimiento consciente y bienestar mental
                para tu transformación completa.
              </p>
              <button
                onClick={() => setActiveSection("alimentacion")}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  border: "2px solid white",
                  borderRadius: "50px",
                  padding: "1rem 2rem",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "white"
                  e.target.style.color = "#667eea"
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.2)"
                  e.target.style.color = "white"
                }}
              >
                Continuar mi transformación
              </button>
            </section>

            {/* Features Section */}
            <section style={{ padding: "4rem 2rem", background: "#f8f9fa" }}>
              <h2
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: "3rem",
                  color: "#333",
                }}
              >
                Todo lo que necesitas en un solo lugar
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "2rem",
                  maxWidth: "1200px",
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "2rem",
                    textAlign: "center",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s ease",
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveSection("alimentacion")}
                  onMouseOver={(e) => (e.target.style.transform = "translateY(-10px)")}
                  onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
                >
                  <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🥗</div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#333" }}>
                    Alimentación Inteligente
                  </h3>
                  <p style={{ color: "#666", lineHeight: "1.6" }}>
                    Calculadora de macros avanzada, seguimiento nutricional y base de datos completa de alimentos.
                  </p>
                </div>

                <div
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "2rem",
                    textAlign: "center",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s ease",
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveSection("movimiento")}
                  onMouseOver={(e) => (e.target.style.transform = "translateY(-10px)")}
                  onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
                >
                  <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>💪</div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#333" }}>
                    Movimiento y Ejercicio
                  </h3>
                  <p style={{ color: "#666", lineHeight: "1.6" }}>
                    Rutinas personalizadas, entrenamientos guiados y seguimiento de progreso en tiempo real.
                  </p>
                </div>

                <div
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "2rem",
                    textAlign: "center",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s ease",
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveSection("mentalidad")}
                  onMouseOver={(e) => (e.target.style.transform = "translateY(-10px)")}
                  onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
                >
                  <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🧠</div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#333" }}>
                    Mentalidad y Bienestar
                  </h3>
                  <p style={{ color: "#666", lineHeight: "1.6" }}>
                    Meditaciones guiadas, técnicas de relajación y herramientas para el bienestar mental.
                  </p>
                </div>
              </div>
            </section>

            {/* Stats Section */}
            <section
              style={{
                padding: "4rem 2rem",
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "2rem",
                  maxWidth: "800px",
                  margin: "0 auto",
                  textAlign: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "0.5rem" }}>10K+</div>
                  <div style={{ opacity: 0.9 }}>Usuarios transformados</div>
                </div>
                <div>
                  <div style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "0.5rem" }}>95%</div>
                  <div style={{ opacity: 0.9 }}>Satisfacción</div>
                </div>
                <div>
                  <div style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "0.5rem" }}>24/7</div>
                  <div style={{ opacity: 0.9 }}>Soporte disponible</div>
                </div>
                <div>
                  <div style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "0.5rem" }}>100+</div>
                  <div style={{ opacity: 0.9 }}>Rutinas disponibles</div>
                </div>
              </div>
            </section>
          </div>
        )
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* Header */}
      <header
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(0,0,0,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "1rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            onClick={handleLogoClick}
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              cursor: "pointer",
            }}
          >
            VitalMente
          </div>

          <nav style={{ display: "flex", gap: "2rem" }}>
            {[
              { key: "inicio", label: "🏠 Inicio" },
              { key: "alimentacion", label: "🥗 Alimentación" },
              { key: "movimiento", label: "💪 Movimiento" },
              { key: "mentalidad", label: "🧠 Mentalidad" },
              { key: "premium", label: "⭐ Premium" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                style={{
                  background:
                    activeSection === key ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "transparent",
                  color: activeSection === key ? "white" : "#333",
                  border: "none",
                  borderRadius: "25px",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  fontWeight: activeSection === key ? "bold" : "normal",
                  transition: "all 0.3s ease",
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "15px",
              padding: "2rem",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <h3 style={{ marginBottom: "1rem", textAlign: "center" }}>🔐 Acceso de Administrador</h3>
            <input
              type="password"
              placeholder="Ingresa el código de acceso"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              style={{
                width: "100%",
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            />
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={handleAdminAccess}
                style={{
                  flex: 1,
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "1rem",
                  cursor: "pointer",
                }}
              >
                Acceder
              </button>
              <button
                onClick={() => setShowAdminPanel(false)}
                style={{
                  flex: 1,
                  background: "#f5f5f5",
                  color: "#333",
                  border: "none",
                  borderRadius: "8px",
                  padding: "1rem",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>{renderContent()}</main>

      {/* Footer */}
      <footer
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "3rem 2rem 2rem 2rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "2rem",
              marginBottom: "2rem",
            }}
          >
            <div>
              <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem" }}>VitalMente</h4>
              <p style={{ opacity: 0.8, lineHeight: "1.6" }}>
                Transformando vidas a través de la alimentación inteligente, el movimiento consciente y el bienestar
                mental.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem" }}>Servicios</h4>
              <ul style={{ listStyle: "none", padding: 0, opacity: 0.8 }}>
                <li style={{ marginBottom: "0.5rem" }}>Calculadora de Macros</li>
                <li style={{ marginBottom: "0.5rem" }}>Rutinas de Ejercicio</li>
                <li style={{ marginBottom: "0.5rem" }}>Meditaciones Guiadas</li>
                <li style={{ marginBottom: "0.5rem" }}>Planes Premium</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem" }}>Contacto</h4>
              <div style={{ opacity: 0.8 }}>
                <div style={{ marginBottom: "0.5rem" }}>📧 hola@vitalmente.com</div>
                <div style={{ marginBottom: "0.5rem" }}>📱 +1 (555) 123-4567</div>
                <div>🌐 www.vitalmente.com</div>
              </div>
            </div>
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.2)",
              paddingTop: "2rem",
              opacity: 0.8,
            }}
          >
            © 2024 VitalMente. Todos los derechos reservados. | Hecho con ❤️ para tu bienestar
          </div>
        </div>
      </footer>
    </div>
  )
}
