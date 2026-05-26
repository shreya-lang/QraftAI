"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";

import Link from "next/link";

const performanceData = [
  { attempt: 1, score: 5 },
  { attempt: 2, score: 7 },
  { attempt: 3, score: 8 },
  { attempt: 4, score: 9 },
  { attempt: 5, score: 10 }
];

const difficultyData = [
  { name: "Easy", value: 2 },
  { name: "Medium", value: 5 },
  { name: "Hard", value: 3 }
];

const COLORS = [
  "#22c55e",
  "#eab308",
  "#ef4444"
];

export default function DashboardPage() {

  return (

    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-purple-950 text-white p-10">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-12">

        <div>

          <h1 className="text-6xl font-black">

            Analytics Dashboard

          </h1>

          <p className="text-gray-400 mt-3 text-lg">

            Live AI learning analytics and performance tracking

          </p>

        </div>

        <Link href="/">

          <button className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-2xl transition">

            Back Home

          </button>

        </Link>

      </div>


      {/* STATS */}

      <div className="grid md:grid-cols-4 gap-6 mb-10">

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl">

          <h2 className="text-2xl font-bold mb-4">

            Total Attempts

          </h2>

          <p className="text-5xl font-black">

            12

          </p>

        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl">

          <h2 className="text-2xl font-bold mb-4">

            Average Score

          </h2>

          <p className="text-5xl font-black">

            8.2

          </p>

        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl">

          <h2 className="text-2xl font-bold mb-4">

            Highest Score

          </h2>

          <p className="text-5xl font-black">

            10

          </p>

        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl">

          <h2 className="text-2xl font-bold mb-4">

            Current Level

          </h2>

          <p className="text-4xl font-black">

            Hard

          </p>

        </div>

      </div>


      {/* CHARTS */}

      <div className="grid md:grid-cols-2 gap-8">

        {/* LINE CHART */}

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">

          <h2 className="text-3xl font-bold mb-8">

            Score Progression

          </h2>

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <LineChart data={performanceData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="attempt" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="score"
                stroke="#8b5cf6"
                strokeWidth={4}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>


        {/* PIE CHART */}

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">

          <h2 className="text-3xl font-bold mb-8">

            Difficulty Distribution

          </h2>

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <PieChart>

              <Pie
                data={difficultyData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >

                {
                  difficultyData.map(
                    (
                      entry,
                      index
                    ) => (

                      <Cell
                        key={index}
                        fill={COLORS[index]}
                      />
                    )
                  )
                }

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* BAR GRAPH */}

      <div className="mt-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">

        <h2 className="text-3xl font-bold mb-8">

          Performance Analytics

        </h2>

        <ResponsiveContainer
          width="100%"
          height={400}
        >

          <BarChart data={performanceData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="attempt" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="score"
              fill="#06b6d4"
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}