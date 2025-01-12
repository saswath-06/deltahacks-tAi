import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudySession from './StudySession';
import AiChat from './AiChat';

interface UserProgress {
    current_level: string;
    mastered_topics: string[];
    learning_goals: string[];
}

interface StudyMaterial {
    id: number;
    filename: string;
    topics: string[];
    difficulty_level: string;
    last_accessed?: string;
}

const StudyDashboard: React.FC = () => {
    const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [streak, setStreak] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user progress
                const progressResponse = await fetch('/api/tutor/progress');
                if (!progressResponse.ok) {
                    throw new Error('Failed to fetch progress');
                }
                const progressData = await progressResponse.json();
                setUserProgress(progressData);

                // Fetch study materials
                const materialsResponse = await fetch('/api/drive/materials');
                if (materialsResponse.ok) {
                    const materialsData = await materialsResponse.json();
                    setMaterials(materialsData.materials);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
                // If unauthorized, redirect to login
                if ((error as any).status === 401) {
                    navigate('/login');
                }
            }
        };

        fetchData();
    }, [navigate]);

    const handleGoogleDriveConnect = async () => {
        try {
            const response = await fetch('/api/drive/auth-url');
            const data = await response.json();
            window.location.href = data.url;
        } catch (error) {
            console.error('Error connecting to Google Drive:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Progress Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
                    {userProgress && (
                        <div className="space-y-4">
                            <p className="text-lg">Level: {userProgress.current_level}</p>
                            <div>
                                <h3 className="font-semibold">Mastered Topics:</h3>
                                <ul className="list-disc pl-5">
                                    {userProgress.mastered_topics.map((topic, index) => (
                                        <li key={index}>{topic}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">Learning Goals:</h3>
                                <ul className="list-disc pl-5">
                                    {userProgress.learning_goals.map((goal, index) => (
                                        <li key={index}>{goal}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Study Session Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Study Session</h2>
                    <StudySession />
                </div>

                {/* Study Materials Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Study Materials</h2>
                    {materials.length === 0 ? (
                        <div className="text-center">
                            <p className="mb-4">No study materials connected yet.</p>
                            <button
                                onClick={handleGoogleDriveConnect}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Connect Google Drive
                            </button>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {materials.map((material) => (
                                <li key={material.id} className="border-b pb-2">
                                    <h3 className="font-semibold">{material.filename}</h3>
                                    <p className="text-sm text-gray-600">
                                        Level: {material.difficulty_level}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Topics: {material.topics.join(', ')}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* AI Chat Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">AI Tutor</h2>
                    <AiChat />
                </div>
            </div>
        </div>
    );
};

export default StudyDashboard;