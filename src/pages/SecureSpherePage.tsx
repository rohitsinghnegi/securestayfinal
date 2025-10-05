import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Phone } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

interface SecureSphereData {
  connectivity: number;
  crimeRecord: number;
  services: number;
  overall: number;
}

const ScoreBar = ({ score, label, color }: { score: number; label: string; color: string }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-base font-medium text-gray-700">{label}</span>
      <span className={`text-sm font-semibold`} style={{ color }}>{score} / 100</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className={`h-2.5 rounded-full`} style={{ width: `${score}%`, backgroundColor: color }}></div>
    </div>
  </div>
);

const SecureSpherePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SecureSphereData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScore = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/rooms/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const roomData = await response.json();
        if (roomData.secureSphere) {
          setData(roomData.secureSphere);
        }
      } catch (error) {
        console.error('Failed to fetch SecureSphere data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchScore();
  }, [id]);

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Card className="p-8">
        <div className="text-center mb-8">
          <Shield className="mx-auto h-16 w-16 text-pink-500" />
          <h1 className="text-4xl font-bold mt-4">SecureSphere Score</h1>
        </div>
        <div className="text-center mb-10">
          <p className="text-gray-500">Overall Score</p>
          <p className="text-6xl font-bold text-pink-500">{data?.overall}</p>
        </div>
        <div className="space-y-6 mb-10">
          <ScoreBar score={data?.connectivity || 0} label="Connectivity" color="#3b82f6" />
          <ScoreBar score={data?.crimeRecord || 0} label="Crime Record (Lower is Better)" color="#f59e0b" />
          <ScoreBar score={data?.services || 0} label="Essential Services" color="#10b981" />
        </div>
        <Card className="bg-red-50 border border-red-200 p-6">
          <h3 className="text-2xl font-bold text-red-700 flex items-center mb-4"><Phone className="mr-3" />SOS Contacts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div><p className="font-semibold text-red-600">Police</p><a href="tel:100">100</a></div>
            <div><p className="font-semibold text-red-600">Ambulance</p><a href="tel:102">102</a></div>
            <div><p className="font-semibold text-red-600">Women Helpline</p><a href="tel:1091">1091</a></div>
          </div>
        </Card>
      </Card>
      <div className="text-center mt-6">
        <Button variant="outline" onClick={() => navigate(`/property/${id}`)}>Back to Property</Button>
      </div>
    </div>
  );
};

export default SecureSpherePage;
