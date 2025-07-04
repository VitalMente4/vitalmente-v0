"use client"

import { useState } from "react"
import { updateProfile } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface QuickSetupProps {
  user: any
  onComplete: (profile: any) => void
}

export function QuickSetup({ user, onComplete }: QuickSetupProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    gender: "",
    activity_level: "",
    physical_goals: [] as string[],
    emotional_goals: [] as string[],
  })

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleComplete = async () => {
    try {
      const { data, error } = await updateProfile(user.id, {
        age: Number.parseInt(formData.age),
        weight: Number.parseFloat(formData.weight),
        height: Number.parseFloat(formData.height),
        gender: formData.gender as any,
        activity_level: formData.activity_level as any,
        physical_goals: formData.physical_goals,
        emotional_goals: formData.emotional_goals,
      })

      if (error) throw error
      onComplete(data)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const toggleGoal = (goalArray: string[], goal: string, type: "physical" | "emotional") => {
    const newGoals = goalArray.includes(goal) ? goalArray.filter((g) => g !== goal) : [...goalArray, goal]

    setFormData((prev) => ({
      ...prev,
      [type === "physical" ? "physical_goals" : "emotional_goals"]: newGoals,
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Configuremos tu perfil</CardTitle>
          <CardDescription>Paso {step} de 3 - Esto nos ayudará a personalizar tu experiencia</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Información básica</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Edad</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
                    placeholder="70"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData((prev) => ({ ...prev, height: e.target.value }))}
                    placeholder="170"
                  />
                </div>
                <div>
                  <Label>Género</Label>
                  <div className="flex gap-2 mt-1">
                    {["male", "female", "other"].map((gender) => (
                      <Button
                        key={gender}
                        type="button"
                        variant={formData.gender === gender ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData((prev) => ({ ...prev, gender }))}
                      >
                        {gender === "male" ? "♂️ Hombre" : gender === "female" ? "♀️ Mujer" : "⚧️ Otro"}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label>Nivel de actividad</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { key: "sedentary", label: "🪑 Sedentario" },
                    { key: "light", label: "🚶 Ligero" },
                    { key: "moderate", label: "🏃 Moderado" },
                    { key: "active", label: "💪 Activo" },
                  ].map((activity) => (
                    <Button
                      key={activity.key}
                      type="button"
                      variant={formData.activity_level === activity.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, activity_level: activity.key }))}
                    >
                      {activity.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Objetivos físicos</h3>
              <p className="text-sm text-gray-600 mb-4">Selecciona todos los que apliquen:</p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "lose_weight", label: "⚖️ Perder peso" },
                  { key: "gain_muscle", label: "💪 Ganar músculo" },
                  { key: "improve_endurance", label: "🏃 Mejorar resistencia" },
                  { key: "increase_strength", label: "🏋️ Aumentar fuerza" },
                  { key: "improve_flexibility", label: "🤸 Mejorar flexibilidad" },
                  { key: "general_health", label: "❤️ Salud general" },
                ].map((goal) => (
                  <Button
                    key={goal.key}
                    type="button"
                    variant={formData.physical_goals.includes(goal.key) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleGoal(formData.physical_goals, goal.key, "physical")}
                    className="justify-start"
                  >
                    {goal.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Objetivos emocionales</h3>
              <p className="text-sm text-gray-600 mb-4">¿En qué te gustaría trabajar?</p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "reduce_stress", label: "😌 Reducir estrés" },
                  { key: "improve_mood", label: "😊 Mejorar ánimo" },
                  { key: "better_sleep", label: "😴 Dormir mejor" },
                  { key: "increase_energy", label: "⚡ Más energía" },
                  { key: "build_confidence", label: "💪 Confianza" },
                  { key: "mental_clarity", label: "🧠 Claridad mental" },
                ].map((goal) => (
                  <Button
                    key={goal.key}
                    type="button"
                    variant={formData.emotional_goals.includes(goal.key) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleGoal(formData.emotional_goals, goal.key, "emotional")}
                    className="justify-start"
                  >
                    {goal.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button type="button" variant="outline" onClick={handleBack} disabled={step === 1}>
              Anterior
            </Button>

            {step < 3 ? (
              <Button onClick={handleNext}>Siguiente</Button>
            ) : (
              <Button onClick={handleComplete} className="bg-gradient-to-r from-blue-600 to-purple-600">
                ¡Completar configuración!
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
