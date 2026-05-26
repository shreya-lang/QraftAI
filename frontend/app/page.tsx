"use client";

import { useEffect, useState } from "react";

import axios from "axios";

import { motion } from "framer-motion";

import {
  Trophy,
  Brain,
  Sparkles,
  Upload,
  BarChart3,
  LogOut,
  User,
  Wand2
} from "lucide-react";

import Link from "next/link";

import { auth } from "../firebase";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";


export default function Home() {

  // ==========================================
  // AUTH STATES
  // ==========================================

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [currentUser, setCurrentUser] =
    useState<any>(null);


  // ==========================================
  // QUESTION STATES
  // ==========================================

  const [topic, setTopic] =
    useState("");

  const [difficulty, setDifficulty] =
    useState("Medium");

  const [occasion, setOccasion] =
    useState("Quiz");

  const [questions, setQuestions] =
    useState<any[]>([]);

  const [answers, setAnswers] =
    useState<string[]>([]);

  const [evaluations, setEvaluations] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [submitAllLoading, setSubmitAllLoading] =
    useState(false);


  // ==========================================
  // AUTH LISTENER
  // ==========================================

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(auth, (user) => {

        if (user) {

          setCurrentUser(user);
        }
      });

    return () => unsubscribe();

  }, []);


  // ==========================================
  // REGISTER
  // ==========================================

  const register = async () => {

    try {

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Registration Successful");

    } catch (err: any) {

      alert(err.message);
    }
  };


  // ==========================================
  // LOGIN
  // ==========================================

  const login = async () => {

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Login Successful");

    } catch (err: any) {

      alert(err.message);
    }
  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = async () => {

    await signOut(auth);

    setCurrentUser(null);

    setQuestions([]);

    setEvaluations([]);
  };


  // ==========================================
  // GENERATE QUESTIONS
  // ==========================================

  const generateQuestions =
    async () => {

      if (!topic) {

        alert("Enter Topic");

        return;
      }

      setLoading(true);

      try {

        const res = await axios.post(
          "https://qraftai.onrender.com/generate-assessment",
          {
            topic,
            difficulty,
            occasion
          }
        );

        setQuestions(
          res.data.questions
        );

        setAnswers(
          new Array(
            res.data.questions.length
          ).fill("")
        );

        setEvaluations([]);

      } catch (err) {

        console.log(err);

        alert("Question Generation Failed");
      }

      setLoading(false);
    };


  // ==========================================
  // HANDLE ANSWER CHANGE
  // ==========================================

  const handleAnswerChange = (
    index: number,
    value: string
  ) => {

    const updated = [...answers];

    updated[index] = value;

    setAnswers(updated);
  };


  // ==========================================
  // OCR IMAGE UPLOAD
  // ==========================================

  const uploadImage = async (
    index: number,
    file: File
  ) => {

    const formData = new FormData();

    formData.append("file", file);

    try {

      const res = await axios.post(
        "https://qraftai.onrender.com/upload-answer-image",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }
      );

      handleAnswerChange(
        index,
        res.data.extracted_text
      );

      alert("Text Extracted Successfully");

    } catch (err) {

      console.log(err);

      alert("OCR Failed");
    }
  };


  // ==========================================
  // EVALUATE SINGLE ANSWER
  // ==========================================

  const evaluateSingle =
    async (
      question: any,
      answer: string,
      index: number
    ) => {

      try {

        const res = await axios.post(
          "https://qraftai.onrender.com/evaluate",
          {
            question:
              question.question,

            correct_answer:
              question.answer,

            user_answer:
              answer,

            difficulty,

            email:
              currentUser.email
          }
        );

        const updated =
          [...evaluations];

        updated[index] =
          res.data;

        setEvaluations(updated);

      } catch (err) {

        console.log(err);

        alert("Evaluation Failed");
      }
    };


  // ==========================================
  // SUBMIT ENTIRE ASSESSMENT
  // ==========================================

  const submitAllAnswers =
    async () => {

      setSubmitAllLoading(true);

      let allResults: any[] = [];

      try {

        for (
          let i = 0;
          i < questions.length;
          i++
        ) {

          const q = questions[i];

          const res = await axios.post(
            "https://qraftai.onrender.com/evaluate",
            {
              question:
                q.question,

              correct_answer:
                q.answer,

              user_answer:
                answers[i],

              difficulty,

              email:
                currentUser.email
            }
          );

          allResults.push(
            res.data
          );
        }

        setEvaluations(
          allResults
        );

        alert(
          "Entire Assessment Evaluated"
        );

      } catch (err) {

        console.log(err);

        alert("Bulk Evaluation Failed");
      }

      setSubmitAllLoading(false);
    };


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-purple-950 text-white overflow-hidden relative">

      {/* BACKGROUND GLOW */}

      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-[140px] opacity-20"></div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-[140px] opacity-20"></div>


      <div className="relative z-10 p-8">

        {/* HEADER */}

        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12"
        >

          <div>

            <h1 className="text-6xl font-black flex items-center gap-4">

              <Sparkles
                size={50}
                className="text-yellow-400"
              />

              Adaptive AI Learning

            </h1>

            <p className="text-gray-400 mt-3 text-lg">

              AI-powered adaptive assessment platform

            </p>

          </div>

          {
            currentUser && (

              <div className="flex gap-4">

                <Link href="/dashboard">

                  <button className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-2xl flex items-center gap-2 transition">

                    <BarChart3 size={20} />

                    Dashboard

                  </button>

                </Link>

                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-2xl flex items-center gap-2 transition"
                >

                  <LogOut size={20} />

                  Logout

                </button>

              </div>
            )
          }

        </motion.div>


        {/* LOGIN */}

        {
          !currentUser ? (

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-lg mx-auto bg-white/10 border border-white/20 backdrop-blur-xl rounded-3xl p-10"
            >

              <div className="flex items-center gap-3 mb-8">

                <User size={30} />

                <h2 className="text-3xl font-bold">

                  Authentication

                </h2>

              </div>

              <input
                type="email"
                placeholder="Enter Email"
                className="w-full p-4 rounded-2xl bg-black/30 mb-5 outline-none"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

              <input
                type="password"
                placeholder="Enter Password"
                className="w-full p-4 rounded-2xl bg-black/30 mb-6 outline-none"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              <div className="flex gap-4">

                <button
                  onClick={login}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl w-full transition"
                >
                  Login
                </button>

                <button
                  onClick={register}
                  className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-2xl w-full transition"
                >
                  Register
                </button>

              </div>

            </motion.div>

          ) : (

            <div>

              {/* GENERATOR CARD */}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-3xl p-8 mb-12"
              >

                <div className="flex items-center gap-3 mb-8">

                  <Wand2
                    size={35}
                    className="text-pink-400"
                  />

                  <h2 className="text-4xl font-bold">

                    Generate Assessment

                  </h2>

                </div>

                <div className="grid md:grid-cols-3 gap-5">

                  <input
                    type="text"
                    placeholder="Enter Topic"
                    className="p-4 rounded-2xl bg-black/30 outline-none"
                    value={topic}
                    onChange={(e) =>
                      setTopic(e.target.value)
                    }
                  />

                  <select
                    className="p-4 rounded-2xl bg-black/30 outline-none"
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(
                        e.target.value
                      )
                    }
                  >

                    <option>
                      Easy
                    </option>

                    <option>
                      Medium
                    </option>

                    <option>
                      Hard
                    </option>

                  </select>

                  <select
                    className="p-4 rounded-2xl bg-black/30 outline-none"
                    value={occasion}
                    onChange={(e) =>
                      setOccasion(
                        e.target.value
                      )
                    }
                  >

                    <option>
                      Quiz
                    </option>

                    <option>
                      Internal Exam
                    </option>

                    <option>
                      External Exam
                    </option>

                    <option>
                      Placement Test
                    </option>

                    <option>
                      Knowledge Practice
                    </option>

                  </select>

                </div>

                <button
                  onClick={generateQuestions}
                  className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 px-10 py-4 rounded-2xl text-lg font-bold hover:scale-105 transition"
                >

                  {
                    loading
                      ? "Generating Questions..."
                      : "Generate  Questions"
                  }

                </button>

              </motion.div>


              {/* QUESTIONS */}

              <div className="space-y-10">

                {
                  questions.map(
                    (q, index) => (

                      <motion.div
                        key={index}
                        initial={{
                          opacity: 0,
                          y: 50
                        }}
                        animate={{
                          opacity: 1,
                          y: 0
                        }}
                        className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-3xl p-8"
                      >

                        <div className="flex items-center gap-3 mb-6">

                          <Brain
                            className="text-cyan-400"
                            size={35}
                          />

                          <h2 className="text-3xl font-bold">

                            Question {index + 1}

                          </h2>

                        </div>

                        <p className="text-lg mb-5 leading-8">

                          {q.question}

                        </p>

                        <div className="bg-yellow-500/10 border border-yellow-400/20 p-5 rounded-2xl mb-6">

                          <p className="text-yellow-300">

                            Hint:
                            {" "}
                            {q.hint}

                          </p>

                        </div>

                        <textarea
                          rows={6}
                          className="w-full p-5 rounded-2xl bg-black/30 outline-none"
                          placeholder="Write your answer..."
                          value={answers[index] || ""}
                          onChange={(e) =>
                            handleAnswerChange(
                              index,
                              e.target.value
                            )
                          }
                        />

                        <div className="flex gap-4 flex-wrap mt-6">

                          <label className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl cursor-pointer flex items-center gap-2 transition">

                            <Upload size={20} />

                            Upload Image

                            <input
                              type="file"
                              hidden
                              onChange={(e) => {

                                if (
                                  e.target.files &&
                                  e.target.files[0]
                                ) {

                                  uploadImage(
                                    index,
                                    e.target.files[0]
                                  );
                                }
                              }}
                            />

                          </label>

                          <button
                            onClick={() =>
                              evaluateSingle(
                                q,
                                answers[index],
                                index
                              )
                            }
                            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-2xl transition"
                          >
                            Submit Single
                          </button>

                        </div>


                        {/* EVALUATION */}

                        {
                          evaluations[index] && (

                            <motion.div
                              initial={{
                                opacity: 0,
                                scale: 0.9
                              }}
                              animate={{
                                opacity: 1,
                                scale: 1
                              }}
                              className="mt-8 bg-black/40 border border-green-400/20 rounded-3xl p-8"
                            >

                              <div className="flex items-center gap-3 mb-5">

                                <Trophy
                                  className="text-yellow-400"
                                  size={35}
                                />

                                <h3 className="text-4xl font-black">

                                  {
                                    evaluations[index]
                                      .score
                                  }
                                  /10

                                </h3>

                              </div>

                              <div className="space-y-4 text-lg">

                                <p>

                                  <strong>
                                    Feedback:
                                  </strong>

                                  {" "}

                                  {
                                    evaluations[index]
                                      .feedback
                                  }

                                </p>

                                <p>

                                  <strong>
                                    Understanding:
                                  </strong>

                                  {" "}

                                  {
                                    evaluations[index]
                                      .understanding
                                  }

                                </p>

                                <p>

                                  <strong>
                                    Improvement:
                                  </strong>

                                  {" "}

                                  {
                                    evaluations[index]
                                      .improvement
                                  }

                                </p>

                                <p>

                                  <strong>
                                    Next Difficulty:
                                  </strong>

                                  {" "}

                                  {
                                    evaluations[index]
                                      .next_difficulty
                                  }

                                </p>

                              </div>


                              {/* AI DETECTOR */}

                              <div className="mt-8 bg-purple-900/30 rounded-2xl p-6">

                                <h4 className="text-2xl font-bold mb-4">

                                  AI Authenticity Meter

                                </h4>

                                <div className="w-full bg-gray-700 h-6 rounded-full overflow-hidden">

                                  <div
                                    className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 h-6 rounded-full"
                                    style={{
                                      width:
                                        evaluations[index]
                                          .ai_detection
                                          .ai_probability
                                    }}
                                  ></div>

                                </div>

                                <p className="mt-4 text-lg">

                                  {
                                    evaluations[index]
                                      .ai_detection
                                      .verdict
                                  }

                                </p>

                                <p className="text-gray-300 mt-2">

                                  {
                                    evaluations[index]
                                      .ai_detection
                                      .reason
                                  }

                                </p>

                              </div>

                            </motion.div>
                          )
                        }

                      </motion.div>
                    )
                  )
                }

              </div>


              {/* SUBMIT ALL */}

              {
                questions.length > 0 && (

                  <div className="mt-12 flex justify-center">

                    <button
                      onClick={submitAllAnswers}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 px-12 py-5 rounded-3xl text-2xl font-bold hover:scale-105 transition"
                    >

                      {
                        submitAllLoading
                          ? "Evaluating Entire Assessment..."
                          : "Submit Entire Assessment"
                      }

                    </button>

                  </div>
                )
              }

            </div>
          )
        }

      </div>

    </div>
  );
}
