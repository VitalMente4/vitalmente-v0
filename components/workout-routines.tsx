"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RotateCcw, Clock, Target, Zap } from 'lucide-react'

interface Exercise {
  name: string
  duration: number
  reps?: number
  sets?: number
  description: string
}

interface Routine {
  id: string
  name: string
  duration: number
  difficulty: "Principiante" | "Intermedio" | "Avanzado"
  category: string
  exercises: Exercise[]
}

export function WorkoutRoutines() {
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  const routines: Routine[] = [
    {
      id: "1",
      name: "Cardio HIIT Principiante",
      duration: 15,
      difficulty: "Principiante",
      category: "Cardio",
      exercises: [
        { name: "Jumping Jacks", duration: 30, description: "Saltos abriendo y cerrando piernas y brazos" },
        { name: "Descanso", duration: 15, description: "Recuperación activa" },
        { name: "Mountain Climbers", duration: 30, description: "Escaladores en posición de plancha" },
        { name: "Descanso", duration: 15, description: "Recuperación activa" },
        { name: "Burpees", duration: 30, description: "Ejercicio completo: sentadilla, plancha, salto" },
        { name: "Descanso", duration: 15, description: "Recuperación activa" },
      ],
    },
    {
      id: "2",
      name: "Fuerza Tren Superior",
      duration: 25,
      difficulty: "Intermedio",
      category: "Fuerza",
      exercises: [
        { name: "Flexiones", duration: 45, reps: 12, sets: 3, description: "Flexiones de pecho tradicionales" },
        { name: "Descanso", duration: 60, description: "Recuperación entre series" },
        { name: "Pike Push-ups", duration: 45, reps: 10, sets: 3, description: "Flexiones para hombros" },
        { name: "Descanso", duration: 60, description: "Recuperación entre series" },
        { name: "Tricep Dips", duration: 45, reps: 15, sets: 3, description: "Fondos para tríceps en silla" },
      ],
    },
    {
      id: "3",
      name: "Yoga Flow Matutino",
      duration: 20,
      difficulty: "Principiante",
      category: "Flexibilidad",
      exercises: [
        { name: "Saludo al Sol A", duration: 120, description: "Secuencia completa de yoga" },
        { name: "Guerrero I", duration: 60, description: "Postura de fuerza y equilibrio" },
        { name: "Perro Boca Abajo", duration: 90, description: "Estiramiento completo del cuerpo" },
        { name: "Postura del Niño", duration: 60, description: "Relajación y estiramiento de espalda" },
      ],
    },
  ]

  const startRoutine = (routine: Routine) => {
    setActiveRoutine(routine)
    setCurrentExercise(0)
    setTimeLeft(routine.exercises[0].duration)
    setIsActive(true)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Principiante":
        return "bg-green-100 text-green-800"
      case "Intermedio":
        return "bg-yellow-100 text-yellow-800"
      case "Avanzado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Cardio":
        return <Zap className="w-4 h-4" />
      case "Fuerza":
        return <Target className="w-4 h-4" />
      case "Flexibilidad":
        return <RotateCcw className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="routines" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="routines">Rutinas</TabsTrigger>
          <TabsTrigger value="active">Entrenamiento Activo</TabsTrigger>
        </TabsList>

        <TabsContent value="routines" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {routines.map((routine) => (
              <Card key={routine.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{routine.name}</CardTitle>
                    {getCategoryIcon(routine.category)}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {routine.duration} min
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(routine.difficulty)}>{routine.difficulty}</Badge>
                    <Badge variant="outline">{routine.category}</Badge>
                  </div>
                  <div className="text-sm text-gray-600">{routine.exercises.length} ejercicios</div>
                  <Button
                    onClick={() => startRoutine(routine)}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Comenzar Rutina
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeRoutine ? (
            <Card>
              <CardHeader>
                <CardTitle>{activeRoutine.name}</CardTitle>
                <CardDescription>
                  Ejercicio {currentExercise + 1} de {activeRoutine.exercises.length}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                  </div>
                  <div className="text-xl font-semibold mb-2">{activeRoutine.exercises[currentExercise]?.name}</div>
                  <div className="text-gray-600 mb-4">{activeRoutine.exercises[currentExercise]?.description}</div>
                  {activeRoutine.exercises[currentExercise]?.reps && (
                    <div className="text-sm text-gray-500">
                      {activeRoutine.exercises[currentExercise].reps} repeticiones ×{" "}
                      {activeRoutine.exercises[currentExercise].sets} series
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-4">
                  <Button onClick={() => setIsActive(!isActive)} size="lg" className="bg-blue-600 hover:bg-blue-700">
                    {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button
                    onClick={() => {
                      setActiveRoutine(null)
                      setIsActive(false)
                    }}
                    size="lg"
                    variant="outline"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentExercise + 1) / activeRoutine.exercises.length) * 100}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <Target className="w-16 h-16 mx-auto mb-4" />
                  <div className="text-xl font-semibold">No hay rutina activa</div>
                  <div>Selecciona una rutina para comenzar</div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
