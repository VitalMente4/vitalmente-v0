"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RotateCcw, Clock, Heart, Brain, Leaf } from 'lucide-react'

interface Meditation {
  id: string
  title: string
  duration: number
  category: "Relajación" | "Concentración" | "Sueño" | "Ansiedad"
  description: string
  instructions: string[]
}

export function MeditationCenter() {
  const [activeMeditation, setActiveMeditation] = useState<Meditation | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const meditations: Meditation[] = [
    {
      id: "1",
      title: "Respiración 4-7-8",
      duration: 5,
      category: "Relajación",
      description: "Técnica de respiración para reducir el estrés y la ansiedad",
      instructions: [
        "Siéntate cómodamente con la espalda recta",
        "Inhala por la nariz durante 4 segundos",
        "Mantén la respiración durante 7 segundos",
        "Exhala por la boca durante 8 segundos",
        "Repite el ciclo",
      ],
    },
    {
      id: "2",
      title: "Meditación de Atención Plena",
      duration: 10,
      category: "Concentración",
      description: "Desarrolla tu capacidad de concentración y presencia",
      instructions: [
        "Encuentra una posición cómoda",
        "Cierra los ojos suavemente",
        "Enfócate en tu respiración natural",
        "Cuando tu mente divague, regresa gentilmente a la respiración",
        "Observa sin juzgar",
      ],
    },
    {
      id: "3",
      title: "Relajación Progresiva",
      duration: 15,
      category: "Sueño",
      description: "Relaja todo tu cuerpo paso a paso para un mejor descanso",
      instructions: [
        "Acuéstate cómodamente",
        "Comienza tensando los músculos de los pies",
        "Mantén la tensión 5 segundos, luego relaja",
        "Continúa subiendo por todo el cuerpo",
        "Termina con una respiración profunda",
      ],
    },
    {
      id: "4",
      title: "Meditación Anti-Ansiedad",
      duration: 8,
      category: "Ansiedad",
      description: "Calma tu mente y reduce los pensamientos ansiosos",
      instructions: [
        "Siéntate con los pies en el suelo",
        "Identifica 5 cosas que puedes ver",
        "Identifica 4 cosas que puedes tocar",
        "Identifica 3 cosas que puedes escuchar",
        "Identifica 2 cosas que puedes oler",
        "Identifica 1 cosa que puedes saborear",
      ],
    },
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, timeLeft])

  const startMeditation = (meditation: Meditation) => {
    setActiveMeditation(meditation)
    setTimeLeft(meditation.duration * 60)
    setCurrentStep(0)
    setIsPlaying(true)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Relajación":
        return "bg-blue-100 text-blue-800"
      case "Concentración":
        return "bg-purple-100 text-purple-800"
      case "Sueño":
        return "bg-indigo-100 text-indigo-800"
      case "Ansiedad":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Relajación":
        return <Leaf className="w-4 h-4" />
      case "Concentración":
        return <Brain className="w-4 h-4" />
      case "Sueño":
        return <Clock className="w-4 h-4" />
      case "Ansiedad":
        return <Heart className="w-4 h-4" />
      default:
        return <Heart className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="meditations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="meditations">Meditaciones</TabsTrigger>
          <TabsTrigger value="active">Sesión Activa</TabsTrigger>
          <TabsTrigger value="progress">Progreso</TabsTrigger>
        </TabsList>

        <TabsContent value="meditations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {meditations.map((meditation) => (
              <Card key={meditation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{meditation.title}</CardTitle>
                    {getCategoryIcon(meditation.category)}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {meditation.duration} min
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge className={getCategoryColor(meditation.category)}>{meditation.category}</Badge>
                  <p className="text-sm text-gray-600">{meditation.description}</p>
                  <Button
                    onClick={() => startMeditation(meditation)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Comenzar Meditación
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeMeditation ? (
            <Card>
              <CardHeader>
                <CardTitle>{activeMeditation.title}</CardTitle>
                <CardDescription>{activeMeditation.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-purple-600 mb-4">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                  </div>

                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold mb-3">Instrucciones:</h3>
                    <ul className="text-left space-y-2">
                      {activeMeditation.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-sm">{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button
                    onClick={() => {
                      setActiveMeditation(null)
                      setIsPlaying(false)
                    }}
                    size="lg"
                    variant="outline"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((activeMeditation.duration * 60 - timeLeft) / (activeMeditation.duration * 60)) * 100}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <Heart className="w-16 h-16 mx-auto mb-4" />
                  <div className="text-xl font-semibold">No hay meditación activa</div>
                  <div>Selecciona una meditación para comenzar</div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">7</div>
                <div className="text-sm text-gray-600">Días consecutivos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">45</div>
                <div className="text-sm text-gray-600">Minutos esta semana</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">12</div>
                <div className="text-sm text-gray-600">Sesiones completadas</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
