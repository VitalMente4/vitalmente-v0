"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface MacroData {
  calories: number
  protein: number
  carbs: number
  fats: number
}

interface UserData {
  age: number
  weight: number
  height: number
  gender: "male" | "female"
  activity: string
  goal: string
}

export function MacroCalculator() {
  const [userData, setUserData] = useState<UserData>({
    age: 25,
    weight: 70,
    height: 170,
    gender: "male",
    activity: "moderate",
    goal: "maintain",
  })

  const [macros, setMacros] = useState<MacroData>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 67,
  })

  const [dailyIntake, setDailyIntake] = useState<MacroData>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  })

  const calculateMacros = () => {
    // Fórmula Harris-Benedict
    const bmr =
      userData.gender === "male"
        ? 88.362 + 13.397 * userData.weight + 4.799 * userData.height - 5.677 * userData.age
        : 447.593 + 9.247 * userData.weight + 3.098 * userData.height - 4.33 * userData.age

    // Factor de actividad
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    }

    const tdee = bmr * activityFactors[userData.activity as keyof typeof activityFactors]

    // Ajuste por objetivo
    let calories = tdee
    if (userData.goal === "lose") calories *= 0.8
    if (userData.goal === "gain") calories *= 1.2

    const protein = userData.weight * 2.2 // 2.2g por kg
    const fats = (calories * 0.25) / 9 // 25% de calorías
    const carbs = (calories - protein * 4 - fats * 9) / 4

    setMacros({
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats),
    })
  }

  const addFood = (food: MacroData) => {
    setDailyIntake((prev) => ({
      calories: prev.calories + food.calories,
      protein: prev.protein + food.protein,
      carbs: prev.carbs + food.carbs,
      fats: prev.fats + food.fats,
    }))
  }

  const commonFoods = [
    { name: "Pechuga de Pollo (100g)", calories: 165, protein: 31, carbs: 0, fats: 3.6 },
    { name: "Arroz Integral (100g)", calories: 111, protein: 2.6, carbs: 22, fats: 0.9 },
    { name: "Avena (50g)", calories: 190, protein: 6.5, carbs: 32, fats: 3.5 },
    { name: "Plátano (1 unidad)", calories: 105, protein: 1.3, carbs: 27, fats: 0.4 },
    { name: "Almendras (30g)", calories: 174, protein: 6.4, carbs: 6.1, fats: 15 },
    { name: "Huevo (1 unidad)", calories: 70, protein: 6, carbs: 0.6, fats: 5 },
  ]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculadora</TabsTrigger>
          <TabsTrigger value="tracking">Seguimiento</TabsTrigger>
          <TabsTrigger value="foods">Alimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calculadora de Macros</CardTitle>
              <CardDescription>Calcula tus macronutrientes ideales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Edad</Label>
                  <Input
                    id="age"
                    type="number"
                    value={userData.age}
                    onChange={(e) => setUserData((prev) => ({ ...prev, age: Number.parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={userData.weight}
                    onChange={(e) => setUserData((prev) => ({ ...prev, weight: Number.parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={userData.height}
                    onChange={(e) => setUserData((prev) => ({ ...prev, height: Number.parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Género</Label>
                  <select
                    id="gender"
                    className="w-full p-2 border rounded"
                    value={userData.gender}
                    onChange={(e) => setUserData((prev) => ({ ...prev, gender: e.target.value as "male" | "female" }))}
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                  </select>
                </div>
              </div>

              <Button onClick={calculateMacros} className="w-full">
                Calcular Macros
              </Button>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{macros.calories}</div>
                    <div className="text-sm text-gray-600">Calorías</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{macros.protein}g</div>
                    <div className="text-sm text-gray-600">Proteína</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{macros.carbs}g</div>
                    <div className="text-sm text-gray-600">Carbohidratos</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{macros.fats}g</div>
                    <div className="text-sm text-gray-600">Grasas</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seguimiento Diario</CardTitle>
              <CardDescription>Progreso de hoy vs objetivos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Calorías</span>
                    <span>
                      {dailyIntake.calories} / {macros.calories}
                    </span>
                  </div>
                  <Progress value={(dailyIntake.calories / macros.calories) * 100} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Proteína</span>
                    <span>
                      {dailyIntake.protein}g / {macros.protein}g
                    </span>
                  </div>
                  <Progress value={(dailyIntake.protein / macros.protein) * 100} className="bg-green-100" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Carbohidratos</span>
                    <span>
                      {dailyIntake.carbs}g / {macros.carbs}g
                    </span>
                  </div>
                  <Progress value={(dailyIntake.carbs / macros.carbs) * 100} className="bg-yellow-100" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Grasas</span>
                    <span>
                      {dailyIntake.fats}g / {macros.fats}g
                    </span>
                  </div>
                  <Progress value={(dailyIntake.fats / macros.fats) * 100} className="bg-purple-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="foods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Base de Alimentos</CardTitle>
              <CardDescription>Agrega alimentos a tu seguimiento diario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {commonFoods.map((food, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{food.name}</div>
                      <div className="text-sm text-gray-600">
                        {food.calories} cal | {food.protein}g P | {food.carbs}g C | {food.fats}g G
                      </div>
                    </div>
                    <Button size="sm" onClick={() => addFood(food)} className="bg-green-600 hover:bg-green-700">
                      Agregar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
