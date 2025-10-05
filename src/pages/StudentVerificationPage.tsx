import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, Clock, XCircle, Camera } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

const StudentVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const API_BASE_URL: string = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || 'http://localhost:5000';
  const [verificationData, setVerificationData] = useState({
    collegeId: null as File | null,
    aadhaarCard: null as File | null,
    studentId: '',
    collegeName: '',
    course: '',
    year: '',
    status: 'pending' as 'pending' | 'verified' | 'rejected'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const resp = await fetch(`${API_BASE_URL}/api/verification/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) return;
        const data = await resp.json();
        if (data?.verification) {
          setVerificationData((prev) => ({
            ...prev,
            studentId: data.verification.studentId || '',
            collegeName: data.verification.collegeName || '',
            course: data.verification.course || '',
            year: data.verification.year || '',
            status: data.verification.status || 'pending',
          }));
        }
      } catch {}
    };
    fetchStatus();
  }, []);

  const handleFileUpload = (field: 'collegeId' | 'aadhaarCard', file: File) => {
    setVerificationData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to submit verification.');
      return;
    }
    if (user?.role !== 'student') {
      setError('Only student accounts can submit verification.');
      return;
    }
    if (!verificationData.collegeId || !verificationData.aadhaarCard) {
      setError('Please upload both documents.');
      return;
    }
    try {
      setLoading(true);
      const form = new FormData();
      form.append('studentId', verificationData.studentId);
      form.append('collegeName', verificationData.collegeName);
      form.append('course', verificationData.course);
      form.append('year', verificationData.year);
      form.append('collegeId', verificationData.collegeId, verificationData.collegeId.name);
      form.append('aadhaarCard', verificationData.aadhaarCard, verificationData.aadhaarCard.name);

      const resp = await fetch(`${API_BASE_URL}/api/verification/submit`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.message || 'Failed to submit verification');
      }
      const data = await resp.json();
      setVerificationData(prev => ({ ...prev, status: data?.verification?.status || 'pending' }));
      setSuccess('Verification submitted successfully. Your status is now pending.');
    } catch (e: any) {
      setError(e?.message || 'Failed to submit verification');
    } finally {
      setLoading(false);
    }
  };

  const FileUpload = ({ 
    label, 
    field, 
    accept = "image/*" 
  }: { 
    label: string; 
    field: 'collegeId' | 'aadhaarCard'; 
    accept?: string;
  }) => {
    const file = verificationData[field];
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        {file ? (
          <div className="space-y-3">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <p className="font-medium text-green-700">{file.name}</p>
              <p className="text-sm text-gray-600">File uploaded successfully</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              type="button"
              onClick={() => handleFileUpload(field, null as any)}
            >
              Change File
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Camera className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="font-medium text-gray-700">{label}</p>
              <p className="text-sm text-gray-500">
                Upload a clear photo of your {label.toLowerCase()}
              </p>
            </div>
            <input
              type="file"
              accept={accept}
              ref={inputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(field, file);
                  setError(null);
                }
              }}
              className="hidden"
              id={field}
            />
            <Button 
              variant="outline" 
              size="sm" 
              type="button"
              className="cursor-pointer"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
        )}
      </div>
    );
  };

  const getStatusIcon = () => {
    switch (verificationData.status) {
      case 'verified':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Clock className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (verificationData.status) {
      case 'verified':
        return { title: 'Verification Completed', desc: 'Your documents have been verified successfully!' };
      case 'rejected':
        return { title: 'Verification Rejected', desc: 'Please check your documents and try again.' };
      default:
        return { title: 'Verification Pending', desc: 'We are reviewing your documents. This usually takes 24-48 hours.' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Verification</h1>
          <p className="text-gray-600">
            Verify your student status to unlock all features and build trust with landlords
          </p>
        </div>

        {/* Status Card */}
        <Card className="mb-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            {getStatusIcon()}
            <div>
              <h3 className="text-lg font-semibold">{getStatusText().title}</h3>
              <p className="text-gray-600">{getStatusText().desc}</p>
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
              {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
            </div>
          </div>
        </Card>

        {verificationData.status === 'pending' || verificationData.status === 'rejected' ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <Card>
              <h3 className="text-lg font-semibold mb-6">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={verificationData.studentId}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, studentId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter your student ID number"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    College/University Name
                  </label>
                  <input
                    type="text"
                    value={verificationData.collegeName}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, collegeName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="e.g., Delhi University"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course/Program
                  </label>
                  <input
                    type="text"
                    value={verificationData.course}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, course: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="e.g., Computer Science"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year
                  </label>
                  <select
                    value={verificationData.year}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  >
                    <option value="">Select year</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                    <option value="masters">Master's</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Document Upload */}
            <Card>
              <h3 className="text-lg font-semibold mb-6">Document Upload</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">College ID Card</h4>
                  <FileUpload label="College ID Card" field="collegeId" />
                  <p className="text-xs text-gray-500 mt-2">
                    Upload a clear photo of both sides of your college ID card
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Aadhaar Card</h4>
                  <FileUpload label="Aadhaar Card" field="aadhaarCard" />
                  <p className="text-xs text-gray-500 mt-2">
                    Upload a clear photo of your Aadhaar card (PII will be masked for privacy)
                  </p>
                </div>
              </div>
            </Card>

            {/* Terms and Conditions */}
            <Card>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  required
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded mt-1"
                />
                <div className="text-sm text-gray-700">
                  I agree to the{' '}
                  <button type="button" className="text-pink-600 hover:underline">
                    Terms and Conditions
                  </button>
                  {' '}and{' '}
                  <button type="button" className="text-pink-600 hover:underline">
                    Privacy Policy
                  </button>
                  . I understand that my documents will be processed by AI for verification purposes and will be securely deleted after verification is complete.
                </div>
              </label>
            </Card>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/student-dashboard')}
                className="flex-1"
              >
                Skip for Now
              </Button>
              <Button type="submit" className="flex-1" loading={loading}>
                Submit for Verification
              </Button>
            </div>
          </form>
        ) : (
          /* Verification Complete */
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Complete!</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Congratulations! Your student verification has been approved. You now have access to all SecureStays features and increased trust from landlords.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/student-dashboard')}>
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/find-homes')}>
                Find Properties
              </Button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-8 bg-gray-50">
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
            <p className="text-gray-600 text-sm mb-4">
              Having trouble with verification? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={() => navigate('/help')}>
                Contact Support
              </Button>
              <Button variant="ghost" size="sm">
                View FAQ
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentVerificationPage;