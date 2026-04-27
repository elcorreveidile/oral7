'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface DebateResult {
  id: string;
  title: string;
  description: string;
  category: string;
  totalVotes: number;
  score: number;
  averageScore: number;
}

interface ResultsData {
  results: DebateResult[];
  top4: DebateResult[];
  totalVoters: number;
}

export default function PublicResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchResults();
    }
  }, [status, router]);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/debates/results');
      if (!response.ok) throw new Error('Failed to fetch results');
      const data = await response.json();
      console.log('Resultados recibidos:', data);
      setResults(data);
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No hay resultados disponibles</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              📊 Resultados de la Votación
            </h1>
            <p className="text-lg text-gray-600">
              Total de votantes: <span className="font-bold text-blue-600">{results.totalVoters}</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Los 4 temas más votados se debatirán en la Tertulia del Local Cultural de Granada
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">
              🏆 Los 4 Temas Seleccionados
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {results.top4.map((topic, index) => (
                <div key={topic.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                      </span>
                      <div>
                        <h3 className="font-bold text-xl">{topic.title}</h3>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 mt-2">
                          {topic.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-blue-600">{topic.totalVotes}</div>
                      <div className="text-sm text-gray-500">votos</div>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-3">{topic.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📋 Clasificación Completa
            </h2>
            <p className="text-gray-500 mb-6">Todos los temas ordenados por número de votos</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.results.map((topic, index) => (
              <div
                key={topic.id}
                className={`p-5 rounded-lg border-2 transition-all hover:shadow-md ${
                  index < 4
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-800">
                      {topic.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{topic.totalVotes}</div>
                    <div className="text-xs text-gray-500">votos</div>
                  </div>
                </div>
                <h4 className="font-bold text-lg mb-2">{topic.title}</h4>
                <p className="text-gray-600 text-sm">{topic.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a
              href="/votacion-debates"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mr-4"
            >
              Volver a votar
            </a>
            <a
              href="/dashboard"
              className="inline-block px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Volver al panel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
