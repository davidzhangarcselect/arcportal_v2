'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus, Trash2, Download, Upload, FileText, Calendar, Building2, Users,
  MessageSquare, Send, Eye, Clock, AlertCircle, Calculator,
  User, LogOut, Bell, Search, Filter, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { SampleSolicitation, SampleQuestion, SampleProposal, SampleUser } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

const ArcPortal = () => {
  const [currentUser, setCurrentUser] = useState<SampleUser | null>(null);
  const [userType, setUserType] = useState<'vendor' | 'admin'>('vendor');
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedSolicitation, setSelectedSolicitation] = useState<SampleSolicitation | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<SampleProposal | null>(null);
  const [solicitationActiveTab, setSolicitationActiveTab] = useState('overview');
  const [showCreateSolicitation, setShowCreateSolicitation] = useState(false);
  const [newSolicitationData, setNewSolicitationData] = useState({
    number: '',
    title: '',
    description: '',
    agency: '',
    dueDate: '',
    questionCutoffDate: '',
    proposalCutoffDate: '',
    status: 'open' as 'open' | 'closed'
  });
  const [showEditSolicitation, setShowEditSolicitation] = useState(false);
  const [editSolicitationData, setEditSolicitationData] = useState({
    id: '',
    number: '',
    title: '',
    description: '',
    agency: '',
    dueDate: '',
    questionCutoffDate: '',
    proposalCutoffDate: '',
    status: 'open' as 'open' | 'closed'
  });
  
  // Cutoff utility functions
  const isQuestionCutoffPassed = (solicitation: SampleSolicitation) => {
    if (!solicitation.questionCutoffDate) return false;
    return new Date() > new Date(solicitation.questionCutoffDate);
  };

  const isProposalCutoffPassed = (solicitation: SampleSolicitation) => {
    if (!solicitation.proposalCutoffDate) return false;
    return new Date() > new Date(solicitation.proposalCutoffDate);
  };

  const getSolicitationStatus = (solicitation: SampleSolicitation) => {
    if (solicitation.status === 'closed') return 'closed';
    if (isProposalCutoffPassed(solicitation)) return 'proposals_closed';
    if (isQuestionCutoffPassed(solicitation)) return 'questions_closed';
    return 'open';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Open</Badge>;
      case 'questions_closed':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Questions Closed</Badge>;
      case 'proposals_closed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Proposals Closed</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Data states
  const [vendors, setVendors] = useState<SampleUser[]>([]);
  const [solicitations, setSolicitations] = useState<SampleSolicitation[]>([]);
  const [proposals, setProposals] = useState<SampleProposal[]>([]);
  const [questions, setQuestions] = useState<SampleQuestion[]>([]);
  
  // Shared proposal data state
  const [proposalData, setProposalData] = useState({
    solicitationId: 0,
    vendorId: 0,
    technicalFiles: [] as any[],
    pastPerformanceFiles: [] as any[],
    pricingData: {},
    notes: ''
  });

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load solicitations
        const solicitationsResponse = await fetch('/api/solicitations');
        if (solicitationsResponse.ok) {
          const solicitationsData = await solicitationsResponse.json();
          setSolicitations(solicitationsData.map((s: any) => ({
            ...s,
            dueDate: new Date(s.dueDate).toISOString().split('T')[0],
            questionCutoffDate: s.questionCutoffDate ? new Date(s.questionCutoffDate).toISOString().slice(0, 16) : undefined,
            proposalCutoffDate: s.proposalCutoffDate ? new Date(s.proposalCutoffDate).toISOString().slice(0, 16) : undefined,
            status: s.status.toLowerCase(),
            attachments: [
              { name: 'Statement of Work.pdf', size: '2.3 MB' },
              { name: 'Technical Requirements.docx', size: '1.1 MB' }
            ]
          })));
        }

        // Load questions
        const questionsResponse = await fetch('/api/questions');
        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json();
          setQuestions(questionsData.map((q: any) => ({
            id: q.id,
            solicitationId: q.solicitationId,
            vendorId: q.vendorId,
            question: q.question,
            answer: q.answer || '',
            status: q.status.toLowerCase(),
            dateAsked: new Date(q.dateAsked).toISOString().split('T')[0],
            dateAnswered: q.dateAnswered ? new Date(q.dateAnswered).toISOString().split('T')[0] : ''
          })));
        }

        // Load proposals
        const proposalsResponse = await fetch('/api/proposals');
        if (proposalsResponse.ok) {
          const proposalsData = await proposalsResponse.json();
          setProposals(proposalsData.map((p: any) => ({
            id: p.id,
            solicitationId: p.solicitationId,
            vendorId: p.vendorId,
            submissionDate: new Date(p.submissionDate).toISOString().split('T')[0],
            status: p.status.toLowerCase(),
            notes: p.notes || ''
          })));
        }

        // Load vendors/users
        const usersResponse = await fetch('/api/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setVendors(usersData.map((u: any) => ({
            id: u.id,
            name: u.name || '',
            email: u.email,
            companyName: u.companyName || '',
            ueiNumber: u.ueiNumber || '',
            socioEconomicStatus: u.socioEconomicStatus || [],
            registrationDate: new Date(u.createdAt).toISOString().split('T')[0]
          })));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Update proposal data when solicitation changes
  useEffect(() => {
    if (selectedSolicitation) {
      setProposalData((prev: any) => ({
        ...prev,
        solicitationId: selectedSolicitation.id,
        vendorId: currentUser?.id || 0
      }));
    }
  }, [selectedSolicitation]);

  // Authentication
  const login = (userData: SampleUser, type: 'vendor' | 'admin') => {
    setCurrentUser(userData);
    setUserType(type);
    setActiveView('dashboard');
  };

  const logout = () => {
    setCurrentUser(null);
    setUserType('vendor');
    setActiveView('dashboard');
  };

  // Vendor registration
  const registerVendor = (vendorData: Partial<SampleUser>) => {
    const newVendor: SampleUser = {
      id: `vendor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      ...vendorData,
      email: vendorData.email || '',
      socioEconomicStatus: vendorData.socioEconomicStatus || [],
      registrationDate: new Date().toISOString().split('T')[0]
    };
    setVendors([...vendors, newVendor]);
    setCurrentUser(newVendor);
    setActiveView('dashboard');
  };

  // Question submission
  const submitQuestion = async (solicitationId: string, questionText: string) => {
    if (!questionText.trim()) {
      console.error('Question text is empty');
      return;
    }
    
    if (!currentUser) {
      console.error('No current user logged in');
      alert('Please log in to submit a question');
      return;
    }
    
    console.log('Submitting question:', {
      question: questionText,
      vendorId: currentUser.id,
      solicitationId: solicitationId,
      currentUser: currentUser
    });
    
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionText,
          vendorId: currentUser.id,
          solicitationId: solicitationId
        }),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const newQuestion = await response.json();
        console.log('New question created:', newQuestion);
        
        const formattedQuestion = {
          id: newQuestion.id,
          solicitationId: newQuestion.solicitationId,
          vendorId: newQuestion.vendorId,
          question: newQuestion.question,
          answer: newQuestion.answer || '',
          status: newQuestion.status.toLowerCase(),
          dateAsked: new Date(newQuestion.dateAsked).toISOString().split('T')[0],
          dateAnswered: newQuestion.dateAnswered ? new Date(newQuestion.dateAnswered).toISOString().split('T')[0] : ''
        };
        
        setQuestions([...questions, formattedQuestion]);
      } else {
        const errorData = await response.text();
        console.error('Failed to submit question. Status:', response.status, 'Error:', errorData);
        alert(`Failed to submit question: ${errorData}`);
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('Network error while submitting question');
    }
  };

  // Admin question answering
  const answerQuestion = async (questionId: string, answer: string) => {
    try {
      const response = await fetch('/api/questions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: questionId,
          answer: answer
        }),
      });

      if (response.ok) {
        const updatedQuestion = await response.json();
        const formattedQuestion = {
          id: updatedQuestion.id,
          solicitationId: updatedQuestion.solicitationId,
          vendorId: updatedQuestion.vendorId,
          question: updatedQuestion.question,
          answer: updatedQuestion.answer || '',
          status: updatedQuestion.status.toLowerCase(),
          dateAsked: new Date(updatedQuestion.dateAsked).toISOString().split('T')[0],
          dateAnswered: updatedQuestion.dateAnswered ? new Date(updatedQuestion.dateAnswered).toISOString().split('T')[0] : ''
        };
        
        setQuestions(prev => prev.map(q => 
          q.id === questionId ? formattedQuestion : q
        ));
      } else {
        console.error('Failed to answer question');
      }
    } catch (error) {
      console.error('Error answering question:', error);
    }
  };

  // Create new solicitation (admin only)
  const createSolicitation = async (solicitationData: typeof newSolicitationData) => {
    try {
      const response = await fetch('/api/solicitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(solicitationData),
      });

      if (response.ok) {
        const newSolicitation = await response.json();
        const formattedSolicitation = {
          id: newSolicitation.id,
          number: newSolicitation.number,
          title: newSolicitation.title,
          description: newSolicitation.description,
          agency: newSolicitation.agency,
          dueDate: newSolicitation.dueDate,
          status: newSolicitation.status as 'open' | 'closed',
          attachments: [],
          clins: newSolicitation.clins || []
        };
        
        setSolicitations(prev => [formattedSolicitation, ...prev]);
        setShowCreateSolicitation(false);
        setNewSolicitationData({
          number: '',
          title: '',
          description: '',
          agency: '',
          dueDate: '',
          questionCutoffDate: '',
          proposalCutoffDate: '',
          status: 'open'
        });
        alert('Solicitation created successfully!');
      } else {
        const errorData = await response.text();
        console.error('Failed to create solicitation. Status:', response.status, 'Error:', errorData);
        alert(`Failed to create solicitation: ${errorData}`);
      }
    } catch (error) {
      console.error('Error creating solicitation:', error);
      alert('Network error while creating solicitation');
    }
  };

  // Update solicitation
  const updateSolicitation = async (solicitationData: typeof editSolicitationData) => {
    try {
      const response = await fetch('/api/solicitations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(solicitationData),
      });

      if (response.ok) {
        const updatedSolicitation = await response.json();
        const formattedSolicitation = {
          id: updatedSolicitation.id,
          number: updatedSolicitation.number,
          title: updatedSolicitation.title,
          description: updatedSolicitation.description,
          agency: updatedSolicitation.agency,
          dueDate: updatedSolicitation.dueDate,
          questionCutoffDate: updatedSolicitation.questionCutoffDate ? new Date(updatedSolicitation.questionCutoffDate).toISOString().slice(0, 16) : undefined,
          proposalCutoffDate: updatedSolicitation.proposalCutoffDate ? new Date(updatedSolicitation.proposalCutoffDate).toISOString().slice(0, 16) : undefined,
          status: updatedSolicitation.status.toLowerCase() as 'open' | 'closed',
          attachments: [],
          clins: updatedSolicitation.clins || []
        };
        
        setSolicitations(prev => prev.map(s => s.id === formattedSolicitation.id ? formattedSolicitation : s));
        setSelectedSolicitation(formattedSolicitation);
        setShowEditSolicitation(false);
        setEditSolicitationData({
          id: '',
          number: '',
          title: '',
          description: '',
          agency: '',
          dueDate: '',
          questionCutoffDate: '',
          proposalCutoffDate: '',
          status: 'open'
        });
        alert('Solicitation updated successfully!');
      } else {
        const errorData = await response.text();
        console.error('Failed to update solicitation. Status:', response.status, 'Error:', errorData);
        alert(`Failed to update solicitation: ${errorData}`);
      }
    } catch (error) {
      console.error('Error updating solicitation:', error);
      alert('Network error while updating solicitation');
    }
  };

  // Function to start editing a solicitation
  const startEditSolicitation = (solicitation: SampleSolicitation) => {
    setEditSolicitationData({
      id: solicitation.id,
      number: solicitation.number,
      title: solicitation.title,
      description: solicitation.description,
      agency: solicitation.agency,
      dueDate: solicitation.dueDate ? new Date(solicitation.dueDate).toISOString().slice(0, 16) : '',
      questionCutoffDate: solicitation.questionCutoffDate ? new Date(solicitation.questionCutoffDate).toISOString().slice(0, 16) : '',
      proposalCutoffDate: solicitation.proposalCutoffDate ? new Date(solicitation.proposalCutoffDate).toISOString().slice(0, 16) : '',
      status: solicitation.status.toLowerCase() as 'open' | 'closed'
    });
    setShowEditSolicitation(true);
  };

  // Proposal submission
  const submitProposal = async (proposalData: Partial<SampleProposal>) => {
    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId: proposalData.vendorId || currentUser?.id,
          solicitationId: proposalData.solicitationId,
          notes: proposalData.notes || ''
        }),
      });

      if (response.ok) {
        const newProposal = await response.json();
        const formattedProposal = {
          id: newProposal.id,
          solicitationId: newProposal.solicitationId,
          vendorId: newProposal.vendorId,
          submissionDate: new Date(newProposal.submissionDate).toISOString().split('T')[0],
          status: newProposal.status.toLowerCase(),
          notes: newProposal.notes || ''
        };
        
        setProposals([...proposals, formattedProposal]);
        return formattedProposal;
      } else {
        console.error('Failed to submit proposal');
        return null;
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      return null;
    }
  };

  // Update proposal
  const updateProposal = (proposalId: string, updatedData: Partial<SampleProposal>) => {
    setProposals(prev => prev.map(p => 
      p.id === proposalId ? { ...p, ...updatedData } : p
    ));
    setSelectedProposal(null);
  };

  // Login form - show if no current user
  if (!currentUser) {
    const LoginForm = () => {
      const [isRegistering, setIsRegistering] = useState(false);
      const [loginType, setLoginType] = useState('vendor');
      const [formData, setFormData] = useState({
        email: 'vendor@techcorp.com',
        password: '',
        companyName: '',
        ueiNumber: '',
        socioEconomicStatus: [] as string[]
      });

      const socioEconomicOptions = [
        'Small Business',
        'Woman-Owned Small Business (WOSB)',
        'Historically Underutilized Business Zone (HUBZone)',
        'Service-Disabled Veteran-Owned Small Business (SDVOSB)',
        'Veteran-Owned Small Business (VOSB)',
        '8(a) Business Development Program',
        'Minority-Owned Business'
      ];

      const handleSubmit = async () => {
        if (isRegistering && loginType === 'vendor') {
          registerVendor(formData);
        } else {
          if (!formData.email.trim()) {
            alert('Please enter an email address');
            return;
          }
          
          try {
            console.log('Attempting login with email:', formData.email);
            console.log('Login type:', loginType);
            console.log('Form data:', formData);
            
            const response = await fetch('/api/users', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: formData.email
              }),
            });

            console.log('Login response status:', response.status);

            if (response.ok) {
              const userData = await response.json();
              console.log('User data received:', userData);
              
              const formattedUser = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                companyName: userData.companyName,
                ueiNumber: userData.ueiNumber,
                socioEconomicStatus: userData.socioEconomicStatus || [],
                registrationDate: userData.createdAt ? new Date(userData.createdAt).toISOString().split('T')[0] : ''
              };
              
              const userRole = userData.role.toLowerCase() as 'vendor' | 'admin';
              console.log('Logging in as:', userRole, formattedUser);
              login(formattedUser, userRole);
            } else {
              const errorData = await response.text();
              console.error('Login failed. Status:', response.status, 'Error:', errorData);
              alert(`User not found. Please check your email or register as a new vendor.\nError: ${errorData}`);
            }
          } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
          }
        }
      };

      const toggleSocioEconomicStatus = (status: string) => {
        setFormData(prev => ({
          ...prev,
          socioEconomicStatus: prev.socioEconomicStatus.includes(status)
            ? prev.socioEconomicStatus.filter(s => s !== status)
            : [...prev.socioEconomicStatus, status]
        }));
      };

      // Auto-populate sample emails when switching login types
      const handleLoginTypeChange = (type: string) => {
        setLoginType(type);
        if (!isRegistering) {
          const sampleEmail = type === 'admin' ? 'admin@arcportal.gov' : 'vendor@techcorp.com';
          setFormData(prev => ({ ...prev, email: sampleEmail }));
        }
      };

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-blue-900">ArcPortal</CardTitle>
              <CardDescription>Vendor Proposal Management System</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={loginType} onValueChange={handleLoginTypeChange} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="vendor">Vendor</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                {isRegistering && loginType === 'vendor' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ueiNumber">UEI Number</Label>
                      <Input
                        id="ueiNumber"
                        value={formData.ueiNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, ueiNumber: e.target.value }))}
                        placeholder="12 character UEI"
                        maxLength={12}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Socio-Economic Status (Check all that apply)</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {socioEconomicOptions.map(status => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={status}
                              checked={formData.socioEconomicStatus.includes(status)}
                              onCheckedChange={() => toggleSocioEconomicStatus(status)}
                            />
                            <Label htmlFor={status} className="text-sm">{status}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Button onClick={handleSubmit} className="w-full">
                  {isRegistering ? 'Register' : 'Login'}
                </Button>

                {!isRegistering && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800 mb-2">Sample Credentials:</p>
                    <div className="text-xs text-blue-700 space-y-1">
                      {loginType === 'vendor' ? (
                        <p><strong>Vendor:</strong> vendor@techcorp.com</p>
                      ) : (
                        <p><strong>Admin:</strong> admin@arcportal.gov</p>
                      )}
                      <p className="text-blue-600">Password: (any password works for demo)</p>
                    </div>
                  </div>
                )}

                {loginType === 'vendor' && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsRegistering(!isRegistering)}
                  >
                    {isRegistering ? 'Already have an account? Login' : 'New vendor? Register'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    };

    return <LoginForm />;
  }

  // Header Component
  const Header = () => (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-lg overflow-hidden">
              <Image 
                src="/logo.jpg" 
                alt="ArcPortal Logo" 
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ArcPortal</h1>
              <p className="text-sm text-gray-600">{userType === 'admin' ? 'Admin Dashboard' : 'Vendor Portal'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              {userType === 'admin' ? currentUser.name : currentUser.companyName}
            </div>
            <Button onClick={logout} variant="ghost" size="sm">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );

  // Navigation Component
  const Navigation = () => {
    const vendorNavItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Building2 },
      { id: 'solicitations', label: 'Solicitations', icon: FileText },
      { id: 'proposals', label: 'My Proposals', icon: Upload },
      { id: 'profile', label: 'Profile', icon: User }
    ];

    const adminNavItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Building2 },
      { id: 'solicitations', label: 'Manage Solicitations', icon: FileText },
      { id: 'proposals', label: 'Review Proposals', icon: Eye },
      { id: 'questions', label: 'Q&A Management', icon: MessageSquare },
      { id: 'vendors', label: 'Registered Vendors', icon: Users }
    ];

    const navItems = userType === 'admin' ? adminNavItems : vendorNavItems;

    return (
      <nav className="bg-white border-r w-64 min-h-screen p-4">
        <div className="space-y-2">
          {navItems.map(item => (
            <Button
              key={item.id}
              variant={activeView === item.id ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => {
                setActiveView(item.id);
                // Reset solicitation view when clicking on solicitations menu
                if (item.id === 'solicitations') {
                  setSelectedSolicitation(null);
                  setSolicitationActiveTab('overview');
                }
              }}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          ))}
        </div>
      </nav>
    );
  };

  // Dashboard Component
  const Dashboard = () => {
    const openSolicitations = solicitations.filter(s => s.status === 'open');
    const myProposals = proposals.filter(p => p.vendorId === currentUser?.id);

    if (userType === 'admin') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{solicitations.length}</p>
                    <p className="text-sm text-gray-600">Total Solicitations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Upload className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{proposals.length}</p>
                    <p className="text-sm text-gray-600">Total Proposals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{vendors.length}</p>
                    <p className="text-sm text-gray-600">Registered Vendors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{questions.filter(q => q.status === 'pending').length}</p>
                    <p className="text-sm text-gray-600">Pending Questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {questions.slice(-5).map(q => (
                  <div key={q.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Question on {solicitations.find(s => s.id === q.solicitationId)?.number}</p>
                      <p className="text-xs text-gray-600">{q.question.substring(0, 100)}...</p>
                    </div>
                    <Badge variant={q.status === 'answered' ? 'default' : 'secondary'}>
                      {q.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{openSolicitations.length}</p>
                  <p className="text-sm text-gray-600">Open Solicitations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Upload className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{myProposals.length}</p>
                  <p className="text-sm text-gray-600">My Proposals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {openSolicitations.filter(s => {
                      const dueDate = new Date(s.dueDate);
                      const today = new Date();
                      const diffTime = dueDate.getTime() - today.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays <= 7;
                    }).length}
                  </p>
                  <p className="text-sm text-gray-600">Due This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Solicitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {openSolicitations.slice(0, 5).map(solicitation => (
                <div key={solicitation.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                     onClick={() => {
                       setSelectedSolicitation(solicitation);
                       setActiveView('solicitations');
                     }}>
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">{solicitation.number}</p>
                    <p className="text-sm text-gray-600">{solicitation.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Due: {solicitation.dueDate}</p>
                    <Badge variant="outline">{solicitation.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Solicitations Component
  const SolicitationsView = () => {
    if (selectedSolicitation) {
      return <SolicitationDetail solicitation={selectedSolicitation} activeTab={solicitationActiveTab} setActiveTab={setSolicitationActiveTab} />;
    }
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Solicitations</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input placeholder="Search solicitations..." className="pl-10 w-64" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            {userType === 'admin' && (
              <Button onClick={() => setShowCreateSolicitation(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create New Solicitation
              </Button>
            )}
          </div>
        </div>

        {showCreateSolicitation && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Solicitation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="number">Solicitation Number</Label>
                  <Input
                    id="number"
                    value={newSolicitationData.number}
                    onChange={(e) => setNewSolicitationData(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="e.g., RFP-2024-001"
                  />
                </div>
                <div>
                  <Label htmlFor="agency">Agency</Label>
                  <Input
                    id="agency"
                    value={newSolicitationData.agency}
                    onChange={(e) => setNewSolicitationData(prev => ({ ...prev, agency: e.target.value }))}
                    placeholder="e.g., Department of Defense"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newSolicitationData.title}
                  onChange={(e) => setNewSolicitationData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter solicitation title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSolicitationData.description}
                  onChange={(e) => setNewSolicitationData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter detailed description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dueDate">Proposal Due Date</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={newSolicitationData.dueDate}
                    onChange={(e) => setNewSolicitationData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="questionCutoffDate">Question Cutoff</Label>
                  <Input
                    id="questionCutoffDate"
                    type="datetime-local"
                    value={newSolicitationData.questionCutoffDate}
                    onChange={(e) => setNewSolicitationData(prev => ({ ...prev, questionCutoffDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="proposalCutoffDate">Proposal Cutoff</Label>
                  <Input
                    id="proposalCutoffDate"
                    type="datetime-local"
                    value={newSolicitationData.proposalCutoffDate}
                    onChange={(e) => setNewSolicitationData(prev => ({ ...prev, proposalCutoffDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newSolicitationData.status} onValueChange={(value: 'open' | 'closed') => setNewSolicitationData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateSolicitation(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createSolicitation(newSolicitationData)}
                  disabled={!newSolicitationData.number || !newSolicitationData.title || !newSolicitationData.description}
                >
                  Create Solicitation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showEditSolicitation && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Solicitation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-number">Solicitation Number</Label>
                  <Input
                    id="edit-number"
                    value={editSolicitationData.number}
                    onChange={(e) => setEditSolicitationData(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="e.g., RFP-2024-001"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-agency">Agency</Label>
                  <Input
                    id="edit-agency"
                    value={editSolicitationData.agency}
                    onChange={(e) => setEditSolicitationData(prev => ({ ...prev, agency: e.target.value }))}
                    placeholder="e.g., Department of Defense"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editSolicitationData.title}
                  onChange={(e) => setEditSolicitationData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter solicitation title"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editSolicitationData.description}
                  onChange={(e) => setEditSolicitationData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter detailed description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-dueDate">Proposal Due Date</Label>
                  <Input
                    id="edit-dueDate"
                    type="datetime-local"
                    value={editSolicitationData.dueDate}
                    onChange={(e) => setEditSolicitationData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-questionCutoffDate">Question Cutoff</Label>
                  <Input
                    id="edit-questionCutoffDate"
                    type="datetime-local"
                    value={editSolicitationData.questionCutoffDate}
                    onChange={(e) => setEditSolicitationData(prev => ({ ...prev, questionCutoffDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-proposalCutoffDate">Proposal Cutoff</Label>
                  <Input
                    id="edit-proposalCutoffDate"
                    type="datetime-local"
                    value={editSolicitationData.proposalCutoffDate}
                    onChange={(e) => setEditSolicitationData(prev => ({ ...prev, proposalCutoffDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editSolicitationData.status} onValueChange={(value: 'open' | 'closed') => setEditSolicitationData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditSolicitation(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => updateSolicitation(editSolicitationData)}
                  disabled={!editSolicitationData.number || !editSolicitationData.title || !editSolicitationData.description}
                >
                  Update Solicitation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {solicitations.map(solicitation => (
            <Card key={solicitation.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedSolicitation(solicitation);
                    setSolicitationActiveTab('overview');
                  }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{solicitation.number}</h3>
                      {getStatusBadge(getSolicitationStatus(solicitation))}
                    </div>
                    <h4 className="font-medium mb-2">{solicitation.title}</h4>
                    <p className="text-gray-600 mb-3">{solicitation.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {solicitation.agency}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {solicitation.dueDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {solicitation.attachments?.length || 0} attachments
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {userType === 'admin' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditSolicitation(solicitation);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };



  // Solicitation Detail Component
  const SolicitationDetail = ({ solicitation, activeTab, setActiveTab }: { solicitation: SampleSolicitation, activeTab: string, setActiveTab: (tab: string) => void }) => {
    const [newQuestion, setNewQuestion] = useState('');
    const solicitationQuestions = questions.filter(q => q.solicitationId === solicitation.id);
    const [newAnswer, setNewAnswer] = useState('');
    const [answeringQuestion, setAnsweringQuestion] = useState<string | null>(null);

    const handleSubmitQuestion = async () => {
      if (!newQuestion.trim()) return;
      await submitQuestion(solicitation.id, newQuestion);
      setNewQuestion('');
      // Keep the user on the Q&A tab after submitting
      setActiveTab('questions');
    };

    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button 
              onClick={() => {
                setSelectedSolicitation(null);
                setSolicitationActiveTab('overview');
              }}
              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              Solicitations
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">{solicitation.number}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 font-medium"
              onClick={() => {
                setSelectedSolicitation(null);
                setSolicitationActiveTab('overview');
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              ← Back to All Solicitations
            </Button>
            
            <div>
              <h2 className="text-2xl font-bold">{solicitation.number}</h2>
              <p className="text-gray-600">{solicitation.title}</p>
            </div>
          </div>
        </div>

        {showEditSolicitation && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Solicitation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-number">Solicitation Number</Label>
                  <Input
                    id="edit-number"
                    value={editSolicitationData.number}
                    onChange={(e) => setEditSolicitationData(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="e.g., RFP-2024-001"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-agency">Agency</Label>
                  <Input
                    id="edit-agency"
                    value={editSolicitationData.agency}
                    onChange={(e) => setEditSolicitationData(prev => ({ ...prev, agency: e.target.value }))}
                    placeholder="e.g., Department of Defense"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editSolicitationData.title}
                  onChange={(e) => setEditSolicitationData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter solicitation title"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editSolicitationData.description}
                  onChange={(e) => setEditSolicitationData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter detailed description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-dueDate">Proposal Due Date</Label>
                  <Input
                    id="edit-dueDate"
                    type="datetime-local"
                    value={editSolicitationData.dueDate}
                    onChange={(e) => setEditSolicitationData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-questionCutoffDate">Question Cutoff</Label>
                  <Input
                    id="edit-questionCutoffDate"
                    type="datetime-local"
                    value={editSolicitationData.questionCutoffDate}
                    onChange={(e) => setEditSolicitationData(prev => ({ ...prev, questionCutoffDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-proposalCutoffDate">Proposal Cutoff</Label>
                  <Input
                    id="edit-proposalCutoffDate"
                    type="datetime-local"
                    value={editSolicitationData.proposalCutoffDate}
                    onChange={(e) => setEditSolicitationData(prev => ({ ...prev, proposalCutoffDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editSolicitationData.status} onValueChange={(value: 'open' | 'closed') => setEditSolicitationData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditSolicitation(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => updateSolicitation(editSolicitationData)}
                  disabled={!editSolicitationData.number || !editSolicitationData.title || !editSolicitationData.description}
                >
                  Update Solicitation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="questions">Q&A</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            {userType === 'vendor' && !isProposalCutoffPassed(solicitation) && (
              <>
                <TabsTrigger value="proposal-attachments">Proposal Attachments</TabsTrigger>
                <TabsTrigger value="submit">Submit Proposal</TabsTrigger>
              </>
            )}
            {userType === 'vendor' && isProposalCutoffPassed(solicitation) && (
              <TabsTrigger value="proposal-closed" disabled>
                Proposal Submission Closed
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Solicitation Information</CardTitle>
                  {userType === 'admin' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => startEditSolicitation(solicitation)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Solicitation Number</Label>
                    <p className="font-medium">{solicitation.number}</p>
                  </div>
                  <div>
                    <Label>Agency</Label>
                    <p className="font-medium">{solicitation.agency}</p>
                  </div>
                  <div>
                    <Label>Proposal Due Date</Label>
                    <p className="font-medium">{solicitation.dueDate}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    {getStatusBadge(getSolicitationStatus(solicitation))}
                  </div>
                </div>
                
                {(solicitation.questionCutoffDate || solicitation.proposalCutoffDate) && (
                  <div className="border-t pt-4">
                    <Label className="text-base font-medium">Submission Deadlines</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {solicitation.questionCutoffDate && (
                        <div>
                          <Label className="text-sm">Question Submissions</Label>
                          <p className={`text-sm font-medium ${isQuestionCutoffPassed(solicitation) ? 'text-red-600' : 'text-gray-900'}`}>
                            {new Date(solicitation.questionCutoffDate).toLocaleString()}
                            {isQuestionCutoffPassed(solicitation) && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">CLOSED</span>
                            )}
                          </p>
                        </div>
                      )}
                      {solicitation.proposalCutoffDate && (
                        <div>
                          <Label className="text-sm">Proposal Submissions</Label>
                          <p className={`text-sm font-medium ${isProposalCutoffPassed(solicitation) ? 'text-red-600' : 'text-gray-900'}`}>
                            {new Date(solicitation.proposalCutoffDate).toLocaleString()}
                            {isProposalCutoffPassed(solicitation) && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">CLOSED</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <Label>Description</Label>
                  <p className="mt-1">{solicitation.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contract Line Items (CLINs)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {solicitation.clins.map(clin => (
                    <div key={clin.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{clin.name}</p>
                        <p className="text-sm text-gray-600">{clin.description}</p>
                      </div>
                      <Badge variant="outline">{clin.pricingModel}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Solicitation Attachments</CardTitle>
                <CardDescription>
                  Download documents related to this solicitation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(solicitation.attachments || []).map((attachment, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium">{attachment.name}</p>
                        <p className="text-sm text-gray-600">{attachment.size}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            {userType === 'vendor' && (
              <Card>
                <CardHeader>
                  <CardTitle>Submit a Question</CardTitle>
                  <CardDescription>
                    {isQuestionCutoffPassed(solicitation) 
                      ? "Question submission period has ended."
                      : "Ask questions about this solicitation. Responses will be visible to all vendors."
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isQuestionCutoffPassed(solicitation) ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">Question Submission Closed</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        The deadline for submitting questions was {solicitation.questionCutoffDate ? new Date(solicitation.questionCutoffDate).toLocaleString() : 'not specified'}.
                      </p>
                    </div>
                  ) : (
                    <>
                      <Textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Enter your question here..."
                        rows={3}
                      />
                      <Button onClick={handleSubmitQuestion} disabled={!newQuestion.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Question
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Questions & Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {solicitationQuestions.map((q, index) => (
                    <div key={q.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium">Question #{index + 1}</p>
                          <p className="text-sm text-gray-600">Asked on {q.dateAsked}</p>
                        </div>
                        <Badge variant={q.status === 'answered' ? 'default' : 'secondary'}>
                          {q.status}
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <Label className="text-sm font-medium text-gray-700">Question:</Label>
                        <p className="mt-1">{q.question}</p>
                      </div>
                      
                      {q.status === 'answered' && q.answer && (
                        <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                          <Label className="text-sm font-medium text-blue-800">Answer:</Label>
                          <p className="mt-1 text-blue-900">{q.answer}</p>
                          <p className="text-xs text-blue-600 mt-2">Answered on {q.dateAnswered}</p>
                        </div>
                      )}
                      
                      {userType === 'admin' && q.status === 'pending' && (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            value={answeringQuestion === q.id ? newAnswer : ''}
                            onChange={(e) => {
                              setAnsweringQuestion(q.id);
                              setNewAnswer(e.target.value);
                            }}
                            placeholder="Enter your answer..."
                            rows={2}
                          />
                          <Button
                            size="sm"
                            onClick={async () => {
                              await answerQuestion(q.id, newAnswer);
                              setNewAnswer('');
                              setAnsweringQuestion(null);
                              // Keep the user on the Q&A tab after answering
                              setActiveTab('questions');
                            }}
                            disabled={!newAnswer.trim()}
                          >
                            Post Answer
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {solicitationQuestions.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No questions submitted yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <PriceEvaluationTool solicitation={solicitation} />
          </TabsContent>

          {userType === 'vendor' && !isProposalCutoffPassed(solicitation) && (
            <>
              <TabsContent value="proposal-attachments" className="space-y-4">
                <ProposalAttachments solicitation={solicitation} proposalData={proposalData} setProposalData={setProposalData} setActiveTab={setActiveTab} />
              </TabsContent>
              <TabsContent value="submit" className="space-y-4">
                <ProposalSubmission solicitation={solicitation} proposalData={proposalData} onSubmit={submitProposal} setActiveTab={setActiveTab} />
              </TabsContent>
            </>
          )}
          
          {userType === 'vendor' && isProposalCutoffPassed(solicitation) && (
            <TabsContent value="proposal-closed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Proposal Submission Closed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
                    <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-red-800 mb-2">Submission Period Ended</h3>
                    <p className="text-red-700 mb-4">
                      The deadline for proposal submissions was {solicitation.proposalCutoffDate ? new Date(solicitation.proposalCutoffDate).toLocaleString() : 'not specified'}.
                    </p>
                    <p className="text-sm text-red-600">
                      No new proposals can be submitted for this solicitation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    );
  };

  // Proposal Attachments Component
  const ProposalAttachments = ({ solicitation, proposalData, setProposalData, setActiveTab }: { 
    solicitation: SampleSolicitation, 
    proposalData: any, 
    setProposalData: (data: any) => void,
    setActiveTab: (tab: string) => void
  }) => {
    const handleFileUpload = (type: string, files: FileList | null) => {
      if (!files) return;
      const fileList = Array.from(files).map(file => ({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: file.type
      }));
      
      setProposalData((prev: any) => ({
        ...prev,
        [type]: [...prev[type as keyof typeof prev] as any[], ...fileList]
      }));
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Proposal Attachments</CardTitle>
          <CardDescription>
            Upload your proposal documents for {solicitation.number}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Technical Proposal</Label>
              <p className="text-sm text-gray-600 mb-3">Upload technical documentation and approach</p>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Drop files here or click to browse</p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="technical-files"
                  onChange={(e) => handleFileUpload('technicalFiles', e.target.files)}
                />
                <Button variant="outline" onClick={() => document.getElementById('technical-files')?.click()}>
                  Choose Files
                </Button>
              </div>
              {proposalData.technicalFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {proposalData.technicalFiles.map((file: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      {file.name} ({file.size})
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-base font-medium">Past Performance</Label>
              <p className="text-sm text-gray-600 mb-3">Upload past performance documentation</p>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Drop files here or click to browse</p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="performance-files"
                  onChange={(e) => handleFileUpload('pastPerformanceFiles', e.target.files)}
                />
                <Button variant="outline" onClick={() => document.getElementById('performance-files')?.click()}>
                  Choose Files
                </Button>
              </div>
              {proposalData.pastPerformanceFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {proposalData.pastPerformanceFiles.map((file: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      {file.name} ({file.size})
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-base font-medium">Cost Proposal</Label>
              <p className="text-sm text-gray-600 mb-3">Complete your pricing using the integrated tool</p>
              <Alert>
                <Calculator className="h-4 w-4" />
                <AlertDescription>
                  Your pricing data from the Price Evaluation tool will be automatically included in your proposal submission.
                </AlertDescription>
              </Alert>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={proposalData.notes}
                onChange={(e) => setProposalData((prev: any) => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional information or notes..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button variant="outline">Save Draft</Button>
            <Button onClick={() => setActiveTab('submit')}>
              Continue to Submit →
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Proposal Submission Component (Summary & Confirmation)
  const ProposalSubmission = ({ solicitation, proposalData, onSubmit, setActiveTab }: { 
    solicitation: SampleSolicitation, 
    proposalData: any, 
    onSubmit: (data: any) => any,
    setActiveTab: (tab: string) => void
  }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleSubmit = async () => {
      const submittedProposal = await onSubmit(proposalData);
      
      if (submittedProposal) {
        alert(`Proposal #${submittedProposal.id} submitted successfully!\n\nSubmission Details:\n- Technical Files: ${proposalData.technicalFiles.length}\n- Past Performance Files: ${proposalData.pastPerformanceFiles.length}\n- Status: Under Review\n\nYou can track your proposal status in the "My Proposals" section.`);
        setShowConfirmation(false);
      } else {
        alert('Failed to submit proposal. Please try again.');
      }
    };

    const totalFiles = proposalData.technicalFiles.length + proposalData.pastPerformanceFiles.length;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Submit Proposal</CardTitle>
          <CardDescription>
            Review and confirm your proposal submission for {solicitation.number}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border">
              <h3 className="font-medium text-blue-900 mb-3">Proposal Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-blue-800">Solicitation</Label>
                  <p className="font-medium">{solicitation.number}</p>
                </div>
                <div>
                  <Label className="text-blue-800">Company</Label>
                  <p className="font-medium">{currentUser?.companyName || 'Your Company'}</p>
                </div>
                <div>
                  <Label className="text-blue-800">Total Attachments</Label>
                  <p className="font-medium">{totalFiles} files</p>
                </div>
                <div>
                  <Label className="text-blue-800">Due Date</Label>
                  <p className="font-medium">{solicitation.dueDate}</p>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Technical Proposal Files</Label>
              {proposalData.technicalFiles.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {proposalData.technicalFiles.map((file: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                      <FileText className="h-4 w-4 text-blue-600" />
                      {file.name} ({file.size})
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-red-600 mt-1">⚠️ No technical proposal files uploaded</p>
              )}
            </div>

            <div>
              <Label className="text-base font-medium">Past Performance Files</Label>
              {proposalData.pastPerformanceFiles.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {proposalData.pastPerformanceFiles.map((file: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                      <FileText className="h-4 w-4 text-green-600" />
                      {file.name} ({file.size})
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-red-600 mt-1">⚠️ No past performance files uploaded</p>
              )}
            </div>

            <div>
              <Label className="text-base font-medium">Cost Proposal</Label>
              <Alert>
                <Calculator className="h-4 w-4" />
                <AlertDescription>
                  Pricing data from the Price Evaluation tool will be included automatically.
                </AlertDescription>
              </Alert>
            </div>

            {proposalData.notes && (
              <div>
                <Label className="text-base font-medium">Additional Notes</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded border">
                  <p className="text-sm">{proposalData.notes}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Important Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Once submitted, your proposal cannot be modified. Please review all information carefully before proceeding.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <Button variant="outline" onClick={() => setActiveTab('proposal-attachments')}>
              ← Back to Attachments
            </Button>
            <div className="flex gap-3">
              <Button variant="outline">Save Draft</Button>
              <Button 
                onClick={() => setShowConfirmation(true)} 
                className="bg-green-600 hover:bg-green-700"
                disabled={totalFiles === 0}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Submit Proposal
              </Button>
            </div>
          </div>

          {showConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Confirm Proposal Submission</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to submit your proposal for {solicitation.number}? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                    Yes, Submit Proposal
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Price Evaluation Tool Component
  const PriceEvaluationTool = ({ solicitation }: { solicitation: SampleSolicitation }) => {
    const [offerors, setOfferors] = useState<any[]>([]);
    const [clins, setClins] = useState<any[]>([]);
    const [evaluationPeriods, setEvaluationPeriods] = useState([
      { id: 'base_year_1', name: 'Base Year', type: 'base' }
    ]);
    const [evaluationResults, setEvaluationResults] = useState<any>({});
    const [pricingData, setPricingData] = useState<any>({});
    const [activeTab, setActiveTab] = useState('setup');

    // Initialize with solicitation data and current vendor
    useEffect(() => {
      if (solicitation && currentUser) {
        const solicitationClins = solicitation.clins.map(clin => ({
          ...clin,
          description: clin.description || 'Contract Line Item'
        }));
                
        const initialOfferors = [
          { id: 1, name: currentUser.companyName || 'My Company', isIncumbent: false }
        ];
                
        setClins(solicitationClins);
        setOfferors(initialOfferors);
                
        const initialPricing: any = {};
        initialOfferors.forEach(offeror => {
          initialPricing[offeror.id] = {};
          solicitationClins.forEach(clin => {
            initialPricing[offeror.id][clin.id] = {
              basePrice: '',
              laborHours: '',
              laborRate: '',
              materialCost: '',
              indirectRate: '',
              optionYears: [{ price: '', hours: '', rate: '' }]
            };
          });
        });
                
        setPricingData(initialPricing);
      }
    }, [solicitation, currentUser]);

    const addClin = () => {
      const newId = `clin_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const newClin = {
        id: newId,
        name: `CLIN ${String(clins.length + 1).padStart(4, '0')}`,
        description: 'New Contract Line Item',
        pricingModel: 'FFP'
      };
      setClins([...clins, newClin]);

      // Initialize pricing data for the new CLIN
      const newPricing = { ...pricingData };
      offerors.forEach(offeror => {
        if (!newPricing[offeror.id]) newPricing[offeror.id] = {};
        newPricing[offeror.id][newId] = {
          basePrice: '',
          laborHours: '',
          laborRate: '',
          materialCost: '',
          indirectRate: '',
          optionYears: evaluationPeriods.filter(p => p.type === 'option').map(() => ({ price: '', hours: '', rate: '' }))
        };
      });
      setPricingData(newPricing);
    };

    const removeClin = (clinId: number) => {
      setClins(clins.filter(c => c.id !== clinId));
      
      // Remove pricing data for the deleted CLIN
      const newPricing = { ...pricingData };
      offerors.forEach(offeror => {
        if (newPricing[offeror.id]) {
          delete newPricing[offeror.id][clinId];
        }
      });
      setPricingData(newPricing);
    };

    const updateClin = (clinId: number, field: string, value: string) => {
      setClins(clins.map(clin => 
        clin.id === clinId ? { ...clin, [field]: value } : clin
      ));
    };

    const addEvaluationPeriod = () => {
      const newId = `period_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const newPeriod = {
        id: newId,
        name: `Option Year ${evaluationPeriods.filter(p => p.type === 'option').length + 1}`,
        type: 'option'
      };
      setEvaluationPeriods([...evaluationPeriods, newPeriod]);
            
      const newPricing = { ...pricingData };
      offerors.forEach(offeror => {
        clins.forEach(clin => {
          if (newPricing[offeror.id] && newPricing[offeror.id][clin.id]) {
            newPricing[offeror.id][clin.id].optionYears.push({ price: '', hours: '', rate: '' });
          }
        });
      });
      setPricingData(newPricing);
    };

    const updatePricingData = (offerorId: number, clinId: number, field: string, value: string, yearIndex: number | null = null) => {
      const newPricing = { ...pricingData };
      if (!newPricing[offerorId]) newPricing[offerorId] = {};
      if (!newPricing[offerorId][clinId]) {
        newPricing[offerorId][clinId] = {
          basePrice: '',
          laborHours: '',
          laborRate: '',
          materialCost: '',
          indirectRate: '',
          optionYears: evaluationPeriods.filter(p => p.type === 'option').map(() => ({ price: '', hours: '', rate: '' }))
        };
      }
            
      if (yearIndex !== null) {
        if (!newPricing[offerorId][clinId].optionYears[yearIndex]) {
          newPricing[offerorId][clinId].optionYears[yearIndex] = { price: '', hours: '', rate: '' };
        }
        newPricing[offerorId][clinId].optionYears[yearIndex][field] = value;
      } else {
        newPricing[offerorId][clinId][field] = value;
      }
            
      setPricingData(newPricing);
    };

    const calculateClinTotal = (offerorId: number, clinId: number) => {
      const data = pricingData[offerorId]?.[clinId];
      if (!data) return 0;
            
      const clin = clins.find(c => c.id === clinId);
      if (!clin) return 0;
            
      let baseTotal = 0;
      let optionTotal = 0;
            
      switch (clin.pricingModel) {
        case 'FFP':
          baseTotal = parseFloat(data.basePrice) || 0;
          break;
        case 'T&M':
          baseTotal = (parseFloat(data.laborHours) || 0) * (parseFloat(data.laborRate) || 0);
          break;
        case 'CR':
          const directCost = (parseFloat(data.laborHours) || 0) * (parseFloat(data.laborRate) || 0) + (parseFloat(data.materialCost) || 0);
          baseTotal = directCost * (1 + (parseFloat(data.indirectRate) || 0) / 100);
          break;
      }
            
      const optionPeriods = evaluationPeriods.filter(p => p.type === 'option');
      data.optionYears?.forEach((yearData: any, index: number) => {
        if (index < optionPeriods.length) {
          let yearTotal = 0;
                    
          switch (clin.pricingModel) {
            case 'FFP':
              yearTotal = parseFloat(yearData.price) || 0;
              break;
            case 'T&M':
              yearTotal = (parseFloat(yearData.hours) || 0) * (parseFloat(yearData.rate) || 0);
              break;
            case 'CR':
              const directCost = (parseFloat(yearData.hours) || 0) * (parseFloat(yearData.rate) || 0) + (parseFloat(data.materialCost) || 0);
              yearTotal = directCost * (1 + (parseFloat(data.indirectRate) || 0) / 100);
              break;
          }
                    
          optionTotal += yearTotal;
        }
      });
            
      return baseTotal + optionTotal;
    };

    const calculateOfferorTotal = (offerorId: number) => {
      return clins.reduce((total, clin) => {
        return total + calculateClinTotal(offerorId, clin.id);
      }, 0);
    };

    const performEvaluation = () => {
      const results: any = {};
      const mainOfferor = offerors[0];
            
      if (mainOfferor) {
        const total = calculateOfferorTotal(mainOfferor.id);
        results[mainOfferor.id] = {
          total,
          clinBreakdown: {},
          rank: 1,
          percentAboveLow: 0
        };
                
        clins.forEach(clin => {
          results[mainOfferor.id].clinBreakdown[clin.id] = calculateClinTotal(mainOfferor.id, clin.id);
        });
      }
            
      setEvaluationResults(results);
      setActiveTab('results');
    };

    const getPricingModelBadge = (model: string) => {
      const variants: any = {
        'FFP': 'default',
        'T&M': 'secondary',
        'CR': 'outline'
      };
      return <Badge variant={variants[model] || 'default'}>{model}</Badge>;
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              <Calculator className="h-5 w-5 inline mr-2" />
              Price Evaluation Tool
            </h3>
            <p className="text-gray-600">Cost analysis for {solicitation.number}</p>
          </div>
                    
          <div className="flex gap-3">
            <Button onClick={performEvaluation} className="bg-blue-600 hover:bg-blue-700">
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Results
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="clins">CLINs</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <div className="grid md:grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Calendar className="h-5 w-5 inline mr-2" />
                    Evaluation Periods
                  </CardTitle>
                  <CardDescription>
                    Configure base year and option periods for your proposal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {evaluationPeriods.map(period => (
                    <div key={period.id} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                      <Input
                        value={period.name}
                        onChange={(e) => setEvaluationPeriods(prev =>
                          prev.map(p => p.id === period.id ? { ...p, name: e.target.value } : p)
                        )}
                        placeholder="Period Name"
                        className="flex-1"
                      />
                      <Select
                        value={period.type}
                        onValueChange={(value) => setEvaluationPeriods(prev =>
                          prev.map(p => p.id === period.id ? { ...p, type: value } : p)
                        )}
                        disabled={period.type === 'base'}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="base">Base Year</SelectItem>
                          <SelectItem value="option">Option Year</SelectItem>
                        </SelectContent>
                      </Select>
                      {period.type === 'option' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEvaluationPeriods(prev => prev.filter(p => p.id !== period.id))}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button onClick={addEvaluationPeriod} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option Year
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clins">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Contract Line Items (CLINs)</CardTitle>
                    <CardDescription>Manage CLINs for solicitation {solicitation.number}</CardDescription>
                  </div>
                  <Button onClick={addClin} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add CLIN
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {clins.map(clin => (
                  <div key={clin.id} className="flex items-center gap-4 p-4 border rounded-lg bg-white">
                    <div className="w-32">
                      <Input
                        value={clin.name}
                        onChange={(e) => updateClin(clin.id, 'name', e.target.value)}
                        placeholder="CLIN Name"
                        className="font-medium"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        value={clin.description}
                        onChange={(e) => updateClin(clin.id, 'description', e.target.value)}
                        placeholder="CLIN Description"
                        className="text-gray-700"
                      />
                    </div>
                    <div className="w-48">
                      <Select
                        value={clin.pricingModel}
                        onValueChange={(value) => updateClin(clin.id, 'pricingModel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FFP">Firm Fixed Price</SelectItem>
                          <SelectItem value="T&M">Time & Materials</SelectItem>
                          <SelectItem value="CR">Cost Reimbursable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {getPricingModelBadge(clin.pricingModel)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeClin(clin.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={clins.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {clins.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No CLINs defined. Click "Add CLIN" to create your first contract line item.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <div className="space-y-6">
              {offerors.map(offeror => (
                <Card key={offeror.id}>
                  <CardHeader>
                    <CardTitle>
                      <Building2 className="h-5 w-5 inline mr-2" />
                      {offeror.name}
                    </CardTitle>
                    <CardDescription>
                      Enter pricing data for all contract line items
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {clins.map(clin => (
                      <div key={clin.id} className="space-y-4">
                        <div className="flex items-center gap-3 pb-2 border-b">
                          <h4 className="font-medium text-lg">{clin.name}</h4>
                          <span className="text-gray-600">-</span>
                          <span className="text-gray-700">{clin.description}</span>
                          {getPricingModelBadge(clin.pricingModel)}
                        </div>
                                                
                        <div className="space-y-3">
                          <h5 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Base Year
                          </h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {clin.pricingModel === 'FFP' && (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Total Price</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={pricingData[offeror.id]?.[clin.id]?.basePrice || ''}
                                  onChange={(e) => updatePricingData(offeror.id, clin.id, 'basePrice', e.target.value)}
                                  placeholder="$0.00"
                                />
                              </div>
                            )}
                                                        
                            {(clin.pricingModel === 'T&M' || clin.pricingModel === 'CR') && (
                              <>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Labor Hours</Label>
                                  <Input
                                    type="number"
                                    value={pricingData[offeror.id]?.[clin.id]?.laborHours || ''}
                                    onChange={(e) => updatePricingData(offeror.id, clin.id, 'laborHours', e.target.value)}
                                    placeholder="0"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Labor Rate</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={pricingData[offeror.id]?.[clin.id]?.laborRate || ''}
                                    onChange={(e) => updatePricingData(offeror.id, clin.id, 'laborRate', e.target.value)}
                                    placeholder="$0.00"
                                  />
                                </div>
                              </>
                            )}
                                                        
                            {clin.pricingModel === 'CR' && (
                              <>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Material Cost</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={pricingData[offeror.id]?.[clin.id]?.materialCost || ''}
                                    onChange={(e) => updatePricingData(offeror.id, clin.id, 'materialCost', e.target.value)}
                                    placeholder="$0.00"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Indirect Rate (%)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={pricingData[offeror.id]?.[clin.id]?.indirectRate || ''}
                                    onChange={(e) => updatePricingData(offeror.id, clin.id, 'indirectRate', e.target.value)}
                                    placeholder="0.00"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                                                
                        {evaluationPeriods.filter(p => p.type === 'option').map((period, yearIndex) => (
                          <div key={period.id} className="space-y-3">
                            <h5 className="font-medium text-sm text-gray-700">
                              <Calendar className="h-4 w-4 inline mr-2" />
                              {period.name}
                            </h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {clin.pricingModel === 'FFP' && (
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Total Price</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={pricingData[offeror.id]?.[clin.id]?.optionYears?.[yearIndex]?.price || ''}
                                    onChange={(e) => updatePricingData(offeror.id, clin.id, 'price', e.target.value, yearIndex)}
                                    placeholder="$0.00"
                                  />
                                </div>
                              )}
                                                            
                              {(clin.pricingModel === 'T&M' || clin.pricingModel === 'CR') && (
                                <>
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Labor Hours</Label>
                                    <Input
                                      type="number"
                                      value={pricingData[offeror.id]?.[clin.id]?.optionYears?.[yearIndex]?.hours || ''}
                                      onChange={(e) => updatePricingData(offeror.id, clin.id, 'hours', e.target.value, yearIndex)}
                                      placeholder="0"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Labor Rate</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={pricingData[offeror.id]?.[clin.id]?.optionYears?.[yearIndex]?.rate || ''}
                                      onChange={(e) => updatePricingData(offeror.id, clin.id, 'rate', e.target.value, yearIndex)}
                                      placeholder="$0.00"
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                                                
                        <Alert>
                          <Calculator className="h-4 w-4" />
                          <AlertDescription>
                            <strong>CLIN Total: ${calculateClinTotal(offeror.id, clin.id).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                          </AlertDescription>
                        </Alert>
                      </div>
                    ))}
                                        
                    <Separator />
                                        
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-lg font-semibold text-blue-800">
                        <Calculator className="h-5 w-5 inline mr-2" />
                        Total Evaluated Price: ${calculateOfferorTotal(offeror.id).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="results">
            {Object.keys(evaluationResults).length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Eye className="h-5 w-5 inline mr-2" />
                    Evaluation Results
                  </CardTitle>
                  <CardDescription>
                    Your proposal cost breakdown and summary
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="p-3 text-left font-semibold w-16">Rank</th>
                          <th className="p-3 text-left font-semibold">Vendor</th>
                          <th className="p-3 text-right font-semibold">Total Price</th>
                          <th className="p-3 text-right font-semibold">Status</th>
                          {clins.map(clin => (
                            <th key={clin.id} className="p-3 text-right font-semibold">{clin.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(evaluationResults).map(([offerorId, result]: [string, any]) => {
                          const offeror = offerors.find(o => o.id === parseInt(offerorId));
                          return (
                            <tr key={offerorId} className="border-b bg-blue-50">
                              <td className="p-3 font-medium">
                                <Badge className="bg-blue-600">#1</Badge>
                              </td>
                              <td className="p-3 font-medium">
                                <div className="flex items-center gap-2">
                                  {offeror?.name}
                                </div>
                              </td>
                              <td className="p-3 text-right font-semibold">
                                ${result.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </td>
                              <td className="p-3 text-right">
                                <Badge variant="default">Your Proposal</Badge>
                              </td>
                              {clins.map(clin => (
                                <td key={clin.id} className="p-3 text-right">
                                  ${(result.clinBreakdown[clin.id] || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calculator className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Results Yet</h3>
                  <p className="text-gray-500 mb-4">Enter pricing data and click "Calculate Results" to see the evaluation.</p>
                  <Button onClick={() => setActiveTab('pricing')} variant="outline">
                    Go to Pricing
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const MyProposalsView = () => {
    const myProposals = proposals.filter(p => p.vendorId === currentUser?.id);
        
    if (selectedProposal) {
      return (
        <ProposalDetailView 
          proposal={selectedProposal}
          onBack={() => setSelectedProposal(null)}
          onUpdate={updateProposal}
        />
      );
    }
        
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">My Proposals</h2>
                
        <Card>
          <CardHeader>
            <CardTitle>Submitted Proposals</CardTitle>
            <CardDescription>Track your proposal submissions and status</CardDescription>
          </CardHeader>
          <CardContent>
            {myProposals.length === 0 ? (
              <div className="text-center py-8">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No proposals submitted yet</p>
                <Button variant="outline" onClick={() => setActiveView('solicitations')}>
                  Browse Solicitations
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myProposals.map(proposal => {
                  const solicitation = solicitations.find(s => s.id === proposal.solicitationId);
                  return (
                    <div key={proposal.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">Proposal #{proposal.id}</h3>
                            <Badge variant={
                              proposal.status === 'submitted' ? 'default' :
                              proposal.status === 'under_review' ? 'secondary' :
                              proposal.status === 'awarded' ? 'default' : 'outline'
                            }>
                              {proposal.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Solicitation:</strong> {solicitation?.number} - {solicitation?.title}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Submitted:</strong> {proposal.submissionDate}
                          </p>
                          <p className="text-sm text-gray-600 mb-3">
                            <strong>Files:</strong> {proposal.technicalFiles?.length || 0} technical, {proposal.pastPerformanceFiles?.length || 0} past performance
                          </p>
                          {proposal.notes && (
                            <p className="text-sm text-gray-600">
                              <strong>Notes:</strong> {proposal.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedProposal(proposal)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          {proposal.status === 'submitted' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedProposal(proposal);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Modify
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Proposal Detail View Component
  const ProposalDetailView = ({ proposal, onBack, onUpdate }: { proposal: SampleProposal, onBack: () => void, onUpdate: (id: string, data: any) => void }) => {
    const solicitation = solicitations.find(s => s.id === proposal.solicitationId);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
      technicalFiles: proposal.technicalFiles || [],
      pastPerformanceFiles: proposal.pastPerformanceFiles || [],
      notes: proposal.notes || ''
    });

    const handleFileUpload = (type: string, files: FileList | null) => {
      if (!files) return;
      const fileList = Array.from(files).map(file => ({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: file.type
      }));
      
      setEditData(prev => ({
        ...prev,
        [type]: [...(prev[type as keyof typeof prev] as any[]), ...fileList]
      }));
    };

    const handleRemoveFile = (type: string, index: number) => {
      setEditData(prev => ({
        ...prev,
        [type]: (prev[type as keyof typeof prev] as any[]).filter((_, i) => i !== index)
      }));
    };

    const handleSave = () => {
      onUpdate(proposal.id, editData);
      setIsEditing(false);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onBack}>
              ← Back to My Proposals
            </Button>
            <div>
              <h2 className="text-2xl font-bold">Proposal #{proposal.id}</h2>
              <p className="text-gray-600">{solicitation?.number} - {solicitation?.title}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Badge variant={
              proposal.status === 'submitted' ? 'default' :
              proposal.status === 'under_review' ? 'secondary' :
              proposal.status === 'awarded' ? 'default' : 'outline'
            }>
              {proposal.status.replace('_', ' ').toUpperCase()}
            </Badge>
            {proposal.status === 'submitted' && !isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Edit Proposal
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Proposal ID</Label>
                <p>#{proposal.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Solicitation</Label>
                <p>{solicitation?.number}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Submitted Date</Label>
                <p>{proposal.submissionDate}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge variant="outline">{proposal.status.replace('_', ' ').toUpperCase()}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Solicitation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <p>{solicitation?.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Agency</Label>
                <p>{solicitation?.agency}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Due Date</Label>
                <p>{solicitation?.dueDate}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Technical Proposal Files</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Add more technical files</p>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    id="edit-technical-files"
                    onChange={(e) => handleFileUpload('technicalFiles', e.target.files)}
                  />
                  <Button variant="outline" onClick={() => document.getElementById('edit-technical-files')?.click()}>
                    Choose Files
                  </Button>
                </div>
                <div className="space-y-2">
                  {editData.technicalFiles.map((file: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{file.name} ({file.size})</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveFile('technicalFiles', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {(proposal.technicalFiles || []).map((file: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{file.name} ({file.size})</span>
                  </div>
                ))}
                {(!proposal.technicalFiles || proposal.technicalFiles.length === 0) && (
                  <p className="text-gray-500 text-sm">No technical files uploaded</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Past Performance Files</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Add more past performance files</p>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    id="edit-performance-files"
                    onChange={(e) => handleFileUpload('pastPerformanceFiles', e.target.files)}
                  />
                  <Button variant="outline" onClick={() => document.getElementById('edit-performance-files')?.click()}>
                    Choose Files
                  </Button>
                </div>
                <div className="space-y-2">
                  {editData.pastPerformanceFiles.map((file: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{file.name} ({file.size})</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveFile('pastPerformanceFiles', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {(proposal.pastPerformanceFiles || []).map((file: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{file.name} ({file.size})</span>
                  </div>
                ))}
                {(!proposal.pastPerformanceFiles || proposal.pastPerformanceFiles.length === 0) && (
                  <p className="text-gray-500 text-sm">No past performance files uploaded</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={editData.notes}
                onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional information or notes..."
                rows={4}
              />
            ) : (
              <p className="text-sm">
                {proposal.notes || 'No additional notes provided.'}
              </p>
            )}
          </CardContent>
        </Card>

        {isEditing && (
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Admin Proposal Review Component
  const ProposalReview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Proposal Review</h2>
            
      <Card>
        <CardHeader>
          <CardTitle>All Proposals</CardTitle>
          <CardDescription>Review and evaluate submitted proposals</CardDescription>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No proposals submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {proposals.map(proposal => (
                <div key={proposal.id}>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">Proposal #{proposal.id}</p>
                        <p className="text-sm text-gray-600">
                          Solicitation: {solicitations.find(s => s.id === proposal.solicitationId)?.number}
                        </p>
                        <p className="text-sm text-gray-600">
                          Vendor: {vendors.find(v => v.id === proposal.vendorId)?.companyName || 'Unknown Vendor'}
                        </p>
                        <p className="text-sm text-gray-600">Submitted: {proposal.submissionDate}</p>
                        <p className="text-sm text-gray-600">
                          Files: {proposal.technicalFiles?.length || 0} technical, {proposal.pastPerformanceFiles?.length || 0} past performance
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{proposal.status.replace('_', ' ').toUpperCase()}</Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedProposal(proposal)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                                        
                    <div className="flex gap-2 pt-3 border-t">
                      <Button size="sm" variant="outline"
                              onClick={() => {
                                const updatedProposals = proposals.map(p =>
                                  p.id === proposal.id ? { ...p, status: 'under_review' } : p
                                );
                                setProposals(updatedProposals);
                              }}>
                        Mark Under Review
                      </Button>
                      <Button size="sm" variant="outline"
                              onClick={() => {
                                const updatedProposals = proposals.map(p =>
                                  p.id === proposal.id ? { ...p, status: 'awarded' } : p
                                );
                                setProposals(updatedProposals);
                              }}>
                        Award Contract
                      </Button>
                      <Button size="sm" variant="outline"
                              onClick={() => {
                                const updatedProposals = proposals.map(p =>
                                  p.id === proposal.id ? { ...p, status: 'rejected' } : p
                                );
                                setProposals(updatedProposals);
                              }}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Vendor Profile Component
  const VendorProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      companyName: currentUser?.companyName || '',
      ueiNumber: currentUser?.ueiNumber || '',
      socioEconomicStatus: currentUser?.socioEconomicStatus || []
    });

    const socioEconomicOptions = [
      'Small Business',
      'Woman-Owned Small Business (WOSB)',
      'Historically Underutilized Business Zone (HUBZone)',
      'Service-Disabled Veteran-Owned Small Business (SDVOSB)',
      'Veteran-Owned Small Business (VOSB)',
      '8(a) Business Development Program',
      'Minority-Owned Business'
    ];

    const toggleSocioEconomicStatus = (status: string) => {
      setEditData(prev => ({
        ...prev,
        socioEconomicStatus: prev.socioEconomicStatus.includes(status)
          ? prev.socioEconomicStatus.filter(s => s !== status)
          : [...prev.socioEconomicStatus, status]
      }));
    };

    const handleSave = () => {
      // Update the current user with the new data
      if (currentUser) {
        const updatedUser = { ...currentUser, ...editData };
        setCurrentUser(updatedUser);
        
        // Also update in vendors array if it exists
        setVendors(prev => prev.map(v => 
          v.id === currentUser.id ? updatedUser : v
        ));
      }
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        companyName: currentUser?.companyName || '',
        ueiNumber: currentUser?.ueiNumber || '',
        socioEconomicStatus: currentUser?.socioEconomicStatus || []
      });
      setIsEditing(false);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Vendor Profile</h2>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your contact and identification details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-sm font-medium">{currentUser?.name || 'Not provided'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email address"
                  />
                ) : (
                  <p className="text-sm font-medium">{currentUser?.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Registration Date</Label>
                <p className="text-sm text-gray-600">
                  {currentUser?.registrationDate || new Date().toISOString().split('T')[0]}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Business details and identifiers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                {isEditing ? (
                  <Input
                    id="companyName"
                    value={editData.companyName}
                    onChange={(e) => setEditData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Enter company name"
                  />
                ) : (
                  <p className="text-sm font-medium">{currentUser?.companyName || 'Not provided'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ueiNumber">UEI Number</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Unique Entity Identifier from SAM.gov
                </p>
                {isEditing ? (
                  <Input
                    id="ueiNumber"
                    value={editData.ueiNumber}
                    onChange={(e) => setEditData(prev => ({ ...prev, ueiNumber: e.target.value }))}
                    placeholder="12 character UEI"
                    maxLength={12}
                  />
                ) : (
                  <p className="text-sm font-medium font-mono">
                    {currentUser?.ueiNumber || 'Not provided'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>SAM.gov Status</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={currentUser?.ueiNumber ? 'default' : 'secondary'}>
                    {currentUser?.ueiNumber ? 'Registered' : 'Not Registered'}
                  </Badge>
                  {currentUser?.ueiNumber && (
                    <span className="text-xs text-green-600">✓ Active</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Socio-Economic Status */}
        <Card>
          <CardHeader>
            <CardTitle>Socio-Economic Status</CardTitle>
            <CardDescription>
              Business certifications and socio-economic classifications that may provide contracting advantages
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-3">
                <Label>Select all certifications that apply to your business:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {socioEconomicOptions.map(status => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={status}
                        checked={editData.socioEconomicStatus.includes(status)}
                        onCheckedChange={() => toggleSocioEconomicStatus(status)}
                      />
                      <Label htmlFor={status} className="text-sm font-normal cursor-pointer">
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {currentUser?.socioEconomicStatus && currentUser.socioEconomicStatus.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentUser.socioEconomicStatus.map(status => (
                      <Badge key={status} variant="outline" className="text-xs">
                        {status}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No certifications specified</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Business Activity</CardTitle>
            <CardDescription>Your activity summary on the ARC Portal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {proposals.filter(p => p.vendorId === currentUser?.id).length}
                </div>
                <div className="text-sm text-gray-600">Proposals Submitted</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {proposals.filter(p => p.vendorId === currentUser?.id && p.status === 'awarded').length}
                </div>
                <div className="text-sm text-gray-600">Contracts Awarded</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {questions.filter(q => q.vendorId === currentUser?.id).length}
                </div>
                <div className="text-sm text-gray-600">Questions Asked</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {solicitations.filter(s => s.status === 'open').length}
                </div>
                <div className="text-sm text-gray-600">Open Opportunities</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">UEI Registration</p>
                <p className="text-sm text-gray-600">
                  Register for a Unique Entity Identifier at{' '}
                  <a href="https://sam.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    SAM.gov
                  </a>
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Socio-Economic Certifications</p>
                <p className="text-sm text-gray-600">
                  Learn about small business certifications and how they can help you win contracts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Vendors View Component (Admin only)
  const VendorsView = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Registered Vendors</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input placeholder="Search vendors..." className="pl-10 w-64" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {vendors.map(vendor => (
            <Card key={vendor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{vendor.companyName || vendor.name}</h3>
                      <Badge variant="secondary">
                        {vendor.socioEconomicStatus.length > 0 ? vendor.socioEconomicStatus.join(', ') : 'Standard'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Contact Email</Label>
                        <p className="text-sm">{vendor.email}</p>
                      </div>
                      {vendor.ueiNumber && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">UEI Number</Label>
                          <p className="text-sm font-mono">{vendor.ueiNumber}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {vendor.companyName || 'Individual Vendor'}
                      </span>
                      {vendor.registrationDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Registered: {vendor.registrationDate}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {proposals.filter(p => p.vendorId === vendor.id).length} proposals
                      </span>
                    </div>

                    {vendor.socioEconomicStatus.length > 0 && (
                      <div className="mt-3">
                        <Label className="text-sm font-medium text-gray-600">Socio-Economic Classifications</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {vendor.socioEconomicStatus.map((status, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {status}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {vendors.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Vendors Registered</h3>
                <p className="text-gray-600">No vendors have registered in the system yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  // Q&A Management Component (Admin only)
  const QAManagement = () => {
    const [answeringQuestion, setAnsweringQuestion] = useState<string | null>(null);
    const [newAnswer, setNewAnswer] = useState('');

    const handleAnswerQuestion = async (questionId: string, answer: string) => {
      if (!answer.trim()) return;
      await answerQuestion(questionId, answer);
      setAnsweringQuestion(null);
      setNewAnswer('');
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Q&A Management</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input placeholder="Search questions..." className="pl-10 w-64" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {questions.map(question => {
            const vendor = vendors.find(v => v.id === question.vendorId);
            const solicitation = solicitations.find(s => s.id === question.solicitationId);
            
            return (
              <Card key={question.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={question.status === 'pending' ? 'destructive' : 'default'}>
                            {question.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {solicitation?.number} - {solicitation?.title}
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <Label className="text-sm font-medium text-gray-600">Question from {vendor?.companyName || vendor?.name}</Label>
                          <p className="text-sm mt-1 p-3 bg-gray-50 rounded border">{question.question}</p>
                        </div>

                        {question.answer && (
                          <div className="mb-3">
                            <Label className="text-sm font-medium text-gray-600">Admin Response</Label>
                            <p className="text-sm mt-1 p-3 bg-blue-50 rounded border">{question.answer}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Asked: {question.dateAsked}
                          </span>
                          {question.dateAnswered && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              Answered: {question.dateAnswered}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {vendor?.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {question.status === 'pending' && (
                      <div className="border-t pt-4">
                        {answeringQuestion === question.id ? (
                          <div className="space-y-3">
                            <Label htmlFor={`answer-${question.id}`}>Your Response</Label>
                            <Textarea
                              id={`answer-${question.id}`}
                              value={newAnswer}
                              onChange={(e) => setNewAnswer(e.target.value)}
                              placeholder="Type your response to this question..."
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleAnswerQuestion(question.id, newAnswer)}
                                disabled={!newAnswer.trim()}
                                size="sm"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send Response
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setAnsweringQuestion(null);
                                  setNewAnswer('');
                                }}
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => setAnsweringQuestion(question.id)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Answer Question
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {questions.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Yet</h3>
                <p className="text-gray-600">No vendors have submitted questions yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  // Main render logic for authenticated users
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'solicitations':
        return <SolicitationsView />;
      case 'proposals':
        return userType === 'admin' ? <ProposalReview /> : <MyProposalsView />;
      case 'questions':
        return userType === 'admin' ? <QAManagement /> : <Dashboard />;
      case 'vendors':
        return userType === 'admin' ? <VendorsView /> : <Dashboard />;
      case 'profile':
        return userType === 'vendor' ? <VendorProfile /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-6">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default ArcPortal;
