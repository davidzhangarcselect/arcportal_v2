'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Download, Upload, FileText, Calendar, Building2, Users,
  MessageSquare, Send, Eye, Check, Clock, AlertCircle, Calculator,
  User, Settings, LogOut, Bell, Search, Filter, CheckCircle2
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
  const [isModifyingProposal, setIsModifyingProposal] = useState(false);
  const [solicitationActiveTab, setSolicitationActiveTab] = useState('overview');
  
  // Data states
  const [vendors, setVendors] = useState<SampleUser[]>([]);
  const [solicitations, setSolicitations] = useState<SampleSolicitation[]>([]);
  const [proposals, setProposals] = useState<SampleProposal[]>([]);
  const [questions, setQuestions] = useState<SampleQuestion[]>([]);

  // Initialize sample data
  useEffect(() => {
    const sampleSolicitations = [
      {
        id: 1,
        number: 'RFP-2025-001',
        title: 'Enterprise Software Development Services',
        agency: 'Department of Technology',
        dueDate: '2025-08-15',
        description: 'Seeking qualified vendors for enterprise software development and maintenance services.',
        status: 'open',
        attachments: [
          { name: 'Statement of Work.pdf', size: '2.3 MB' },
          { name: 'Technical Requirements.docx', size: '1.1 MB' }
        ],
        clins: [
          { id: 1, name: 'CLIN 0001', description: 'Software Development Services', pricingModel: 'T&M' },
          { id: 2, name: 'CLIN 0002', description: 'Maintenance & Support', pricingModel: 'FFP' }
        ]
      },
      {
        id: 2,
        number: 'RFP-2025-002', 
        title: 'Cybersecurity Consulting Services',
        agency: 'Department of Defense',
        dueDate: '2025-09-01',
        description: 'Comprehensive cybersecurity assessment and consulting services.',
        status: 'open',
        attachments: [
          { name: 'Security Requirements.pdf', size: '3.1 MB' }
        ],
        clins: [
          { id: 3, name: 'CLIN 0001', description: 'Security Assessment', pricingModel: 'FFP' }
        ]
      }
    ];

    const sampleQuestions = [
      {
        id: 1,
        solicitationId: 1,
        vendorId: 1,
        question: 'What is the expected timeline for project deliverables?',
        answer: 'The project timeline is 18 months with quarterly deliverables.',
        status: 'answered',
        dateAsked: '2025-07-01',
        dateAnswered: '2025-07-03'
      }
    ];

    setSolicitations(sampleSolicitations);
    setQuestions(sampleQuestions);
  }, []);

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
      id: Math.max(...vendors.map(v => v.id), 0) + 1,
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
  const submitQuestion = (solicitationId: number, questionText: string) => {
    if (!questionText.trim() || !currentUser) return;
    
    const question: SampleQuestion = {
      id: Math.max(...questions.map(q => q.id), 0) + 1,
      solicitationId,
      vendorId: currentUser.id,
      question: questionText,
      answer: '',
      status: 'pending',
      dateAsked: new Date().toISOString().split('T')[0],
      dateAnswered: ''
    };
    
    setQuestions([...questions, question]);
  };

  // Admin question answering
  const answerQuestion = (questionId: number, answer: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, answer, status: 'answered', dateAnswered: new Date().toISOString().split('T')[0] }
        : q
    ));
  };

  // Proposal submission
  const submitProposal = (proposalData: Partial<SampleProposal>) => {
    const proposal: SampleProposal = {
      id: Math.max(...proposals.map(p => p.id), 0) + 1,
      solicitationId: proposalData.solicitationId || 0,
      vendorId: proposalData.vendorId || 0,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'submitted',
      ...proposalData
    };
    setProposals([...proposals, proposal]);
    
    setSelectedSolicitation(null);
    setActiveView('proposals');
    
    return proposal;
  };

  // Update proposal
  const updateProposal = (proposalId: number, updatedData: Partial<SampleProposal>) => {
    setProposals(prev => prev.map(p => 
      p.id === proposalId ? { ...p, ...updatedData } : p
    ));
    setIsModifyingProposal(false);
    setSelectedProposal(null);
  };

  // Login form - show if no current user
  if (!currentUser) {
    const LoginForm = () => {
      const [isRegistering, setIsRegistering] = useState(false);
      const [loginType, setLoginType] = useState('vendor');
      const [formData, setFormData] = useState({
        email: '',
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

      const handleSubmit = () => {
        if (isRegistering && loginType === 'vendor') {
          registerVendor(formData);
        } else {
          const userData: SampleUser = loginType === 'admin' 
            ? { id: 1, name: 'Admin User', email: formData.email, socioEconomicStatus: [] }
            : { id: 1, companyName: formData.companyName || 'Demo Vendor', email: formData.email, socioEconomicStatus: [] };
          login(userData, loginType as 'vendor' | 'admin');
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

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-blue-900">ArcPortal</CardTitle>
              <CardDescription>Vendor Proposal Management System</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={loginType} onValueChange={setLoginType} className="mb-6">
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
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <Building2 className="h-6 w-6" />
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
      { id: 'questions', label: 'Q&A Management', icon: MessageSquare }
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
              onClick={() => setActiveView(item.id)}
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
          </div>
        </div>
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
                      <Badge variant={solicitation.status === 'open' ? 'default' : 'secondary'}>
                        {solicitation.status}
                      </Badge>
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
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
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
    const [answeringQuestion, setAnsweringQuestion] = useState<number | null>(null);

    const handleSubmitQuestion = () => {
      if (!newQuestion.trim()) return;
      submitQuestion(solicitation.id, newQuestion);
      setNewQuestion('');
      // Keep the user on the Q&A tab after submitting
      setActiveTab('questions');
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => {
            setSelectedSolicitation(null);
            setSolicitationActiveTab('overview');
          }}>
            ← Back to Solicitations
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{solicitation.number}</h2>
            <p className="text-gray-600">{solicitation.title}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="questions">Q&A</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            {userType === 'vendor' && <TabsTrigger value="proposal">Submit Proposal</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Solicitation Information</CardTitle>
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
                    <Label>Due Date</Label>
                    <p className="font-medium">{solicitation.dueDate}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant={solicitation.status === 'open' ? 'default' : 'secondary'}>
                      {solicitation.status}
                    </Badge>
                  </div>
                </div>
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
                    Ask questions about this solicitation. Responses will be visible to all vendors.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Questions & Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {solicitationQuestions.map(q => (
                    <div key={q.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium">Question #{q.id}</p>
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
                            onClick={() => {
                              answerQuestion(q.id, newAnswer);
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

          {userType === 'vendor' && (
            <TabsContent value="proposal" className="space-y-4">
              <ProposalSubmission solicitation={solicitation} onSubmit={submitProposal} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    );
  };

  // Proposal Submission Component
  const ProposalSubmission = ({ solicitation, onSubmit }: { solicitation: SampleSolicitation, onSubmit: (data: any) => any }) => {
    const [proposalData, setProposalData] = useState({
      solicitationId: solicitation.id,
      vendorId: currentUser?.id || 0,
      technicalFiles: [] as any[],
      pastPerformanceFiles: [] as any[],
      pricingData: {},
      notes: ''
    });

    const handleFileUpload = (type: string, files: FileList | null) => {
      if (!files) return;
      const fileList = Array.from(files).map(file => ({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: file.type
      }));
      
      setProposalData(prev => ({
        ...prev,
        [type]: [...prev[type as keyof typeof prev] as any[], ...fileList]
      }));
    };

    const handleSubmit = () => {
      const submittedProposal = onSubmit(proposalData);
      
      alert(`Proposal #${submittedProposal.id} submitted successfully!\n\nSubmission Details:\n- Technical Files: ${proposalData.technicalFiles.length}\n- Past Performance Files: ${proposalData.pastPerformanceFiles.length}\n- Status: Under Review\n\nYou can track your proposal status in the "My Proposals" section.`);
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Submit Proposal</CardTitle>
          <CardDescription>
            Submit your proposal for {solicitation.number}
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
                  {proposalData.technicalFiles.map((file, index) => (
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
                  {proposalData.pastPerformanceFiles.map((file, index) => (
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
                onChange={(e) => setProposalData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional information or notes..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button variant="outline">Save Draft</Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Submit Proposal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Price Evaluation Tool Component
  const PriceEvaluationTool = ({ solicitation }: { solicitation: SampleSolicitation }) => {
    const [offerors, setOfferors] = useState<any[]>([]);
    const [clins, setClins] = useState<any[]>([]);
    const [evaluationPeriods, setEvaluationPeriods] = useState([
      { id: 1, name: 'Base Year', type: 'base' }
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

    const addEvaluationPeriod = () => {
      const newId = Math.max(...evaluationPeriods.map(p => p.id), 0) + 1;
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
                <CardTitle>Contract Line Items (CLINs)</CardTitle>
                <CardDescription>CLINs from solicitation {solicitation.number}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {clins.map(clin => (
                  <div key={clin.id} className="flex items-center gap-4 p-4 border rounded-lg bg-white">
                    <div className="w-32">
                      <p className="font-medium">{clin.name}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700">{clin.description}</p>
                    </div>
                    <div className="w-48">
                      <Select
                        value={clin.pricingModel}
                        onValueChange={(value) => setClins(prev =>
                          prev.map(c => c.id === clin.id ? { ...c, pricingModel: value } : c)
                        )}
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
                  </div>
                ))}
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
                                setIsModifyingProposal(true);
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
  const ProposalDetailView = ({ proposal, onBack, onUpdate }: { proposal: SampleProposal, onBack: () => void, onUpdate: (id: number, data: any) => void }) => {
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
                        <Button size="sm" variant="outline">
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
        return userType === 'admin' ? <ProposalReview /> : <Dashboard />;
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
