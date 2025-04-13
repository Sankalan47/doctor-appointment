// src/pages/dashboard/doctor/DoctorDashboardPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  //   Users,
  Calendar,
  //   Clock,
  RefreshCw,
  //   AlertCircle,
  CheckCircle,
  //   FileText,
  Video,
  Home,
  ChevronRight,
  Star,
  //   BarChart2,
  User,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  //   CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AreaChart,
  Area,
  //   BarChart,
  //   Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn, formatDate, formatCurrency } from '@/lib/utils';

// Interfaces for our data types
interface AppointmentData {
  id: string;
  type: 'in_clinic' | 'tele_consultation' | 'home_visit';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  scheduledStartTime: string;
  scheduledEndTime: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    age?: number;
  };
  clinic?: {
    id: string;
    name: string;
  };
  reason?: string;
  symptoms?: string;
  fee: number;
  isPaid: boolean;
}

interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  age: number;
  gender: string;
  lastVisit?: string;
  appointments: number;
}

interface StatsData {
  totalPatients: number;
  newPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  totalEarnings: number;
  earningsThisMonth: number;
  averageRating: number;
  totalReviews: number;
}

interface Notification {
  id: string;
  type: 'appointment' | 'patient' | 'payment' | 'system';
  message: string;
  time: string;
  isRead: boolean;
}

export default function DoctorDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<AppointmentData[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentData[]>([]);
  const [recentPatients, setRecentPatients] = useState<PatientData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Sample chart data
  const appointmentTypesData = [
    { name: 'In-clinic', value: 65 },
    { name: 'Teleconsultation', value: 25 },
    { name: 'Home Visit', value: 10 },
  ];

  const weeklyAppointmentsData = [
    { name: 'Mon', appointments: 5 },
    { name: 'Tue', appointments: 7 },
    { name: 'Wed', appointments: 10 },
    { name: 'Thu', appointments: 8 },
    { name: 'Fri', appointments: 12 },
    { name: 'Sat', appointments: 9 },
    { name: 'Sun', appointments: 3 },
  ];

  const monthlyEarningsData = [
    { name: 'Jan', amount: 4200 },
    { name: 'Feb', amount: 4500 },
    { name: 'Mar', amount: 5100 },
    { name: 'Apr', amount: 4800 },
    { name: 'May', amount: 5300 },
    { name: 'Jun', amount: 5800 },
    { name: 'Jul', amount: 6200 },
    { name: 'Aug', amount: 5900 },
    { name: 'Sep', amount: 6500 },
    { name: 'Oct', amount: 7000 },
    { name: 'Nov', amount: 7500 },
    { name: 'Dec', amount: 8000 },
  ];

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FF8042'];

  useEffect(() => {
    // In a real implementation, these would be API calls
    // For this example, we'll simulate them with timeouts
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API calls with timeout
        setTimeout(() => {
          // Mock today's appointments
          setTodayAppointments([
            {
              id: '101',
              type: 'in_clinic',
              status: 'confirmed',
              scheduledStartTime: '2025-04-14T09:00:00Z',
              scheduledEndTime: '2025-04-14T09:30:00Z',
              patient: {
                id: 'p1',
                firstName: 'John',
                lastName: 'Doe',
                profileImage: 'https://randomuser.me/api/portraits/men/73.jpg',
                age: 42,
              },
              clinic: {
                id: 'c1',
                name: 'City Health Clinic',
              },
              reason: 'Annual checkup',
              symptoms: 'None',
              fee: 150,
              isPaid: true,
            },
            {
              id: '102',
              type: 'tele_consultation',
              status: 'confirmed',
              scheduledStartTime: '2025-04-14T11:00:00Z',
              scheduledEndTime: '2025-04-14T11:30:00Z',
              patient: {
                id: 'p2',
                firstName: 'Emma',
                lastName: 'Smith',
                profileImage: 'https://randomuser.me/api/portraits/women/65.jpg',
                age: 35,
              },
              reason: 'Follow-up consultation',
              symptoms: 'Mild headache, fatigue',
              fee: 100,
              isPaid: true,
            },
            {
              id: '103',
              type: 'home_visit',
              status: 'confirmed',
              scheduledStartTime: '2025-04-14T14:00:00Z',
              scheduledEndTime: '2025-04-14T15:00:00Z',
              patient: {
                id: 'p3',
                firstName: 'Robert',
                lastName: 'Johnson',
                profileImage: 'https://randomuser.me/api/portraits/men/42.jpg',
                age: 68,
              },
              reason: 'Mobility issues, routine checkup',
              symptoms: 'Joint pain',
              fee: 250,
              isPaid: false,
            },
            {
              id: '104',
              type: 'in_clinic',
              status: 'confirmed',
              scheduledStartTime: '2025-04-14T16:30:00Z',
              scheduledEndTime: '2025-04-14T17:00:00Z',
              patient: {
                id: 'p4',
                firstName: 'Sophia',
                lastName: 'Garcia',
                profileImage: 'https://randomuser.me/api/portraits/women/28.jpg',
                age: 29,
              },
              clinic: {
                id: 'c1',
                name: 'City Health Clinic',
              },
              reason: 'General consultation',
              symptoms: 'Sore throat, cough',
              fee: 150,
              isPaid: true,
            },
          ]);

          // Mock upcoming appointments
          setUpcomingAppointments([
            {
              id: '105',
              type: 'in_clinic',
              status: 'confirmed',
              scheduledStartTime: '2025-04-15T10:00:00Z',
              scheduledEndTime: '2025-04-15T10:30:00Z',
              patient: {
                id: 'p5',
                firstName: 'Michael',
                lastName: 'Brown',
                profileImage: 'https://randomuser.me/api/portraits/men/22.jpg',
                age: 45,
              },
              clinic: {
                id: 'c1',
                name: 'City Health Clinic',
              },
              reason: 'Heart palpitations',
              symptoms: 'Occasional chest pain, shortness of breath',
              fee: 150,
              isPaid: false,
            },
            {
              id: '106',
              type: 'tele_consultation',
              status: 'confirmed',
              scheduledStartTime: '2025-04-16T09:00:00Z',
              scheduledEndTime: '2025-04-16T09:30:00Z',
              patient: {
                id: 'p6',
                firstName: 'Olivia',
                lastName: 'Miller',
                profileImage: 'https://randomuser.me/api/portraits/women/10.jpg',
                age: 31,
              },
              reason: 'Medicine refill consultation',
              symptoms: '',
              fee: 100,
              isPaid: true,
            },
          ]);

          // Mock recent patients
          setRecentPatients([
            {
              id: 'p1',
              firstName: 'John',
              lastName: 'Doe',
              profileImage: 'https://randomuser.me/api/portraits/men/73.jpg',
              age: 42,
              gender: 'Male',
              lastVisit: '2025-04-14T09:00:00Z',
              appointments: 5,
            },
            {
              id: 'p2',
              firstName: 'Emma',
              lastName: 'Smith',
              profileImage: 'https://randomuser.me/api/portraits/women/65.jpg',
              age: 35,
              gender: 'Female',
              lastVisit: '2025-04-14T11:00:00Z',
              appointments: 3,
            },
            {
              id: 'p3',
              firstName: 'Robert',
              lastName: 'Johnson',
              profileImage: 'https://randomuser.me/api/portraits/men/42.jpg',
              age: 68,
              gender: 'Male',
              lastVisit: '2025-04-14T14:00:00Z',
              appointments: 8,
            },
            {
              id: 'p7',
              firstName: 'Emily',
              lastName: 'Davis',
              profileImage: 'https://randomuser.me/api/portraits/women/33.jpg',
              age: 50,
              gender: 'Female',
              lastVisit: '2025-04-10T10:30:00Z',
              appointments: 2,
            },
          ]);

          // Mock stats
          setStats({
            totalPatients: 248,
            newPatients: 15,
            totalAppointments: 165,
            completedAppointments: 142,
            totalEarnings: 32500,
            earningsThisMonth: 7500,
            averageRating: 4.8,
            totalReviews: 178,
          });

          // Mock notifications
          setNotifications([
            {
              id: 'n1',
              type: 'appointment',
              message: 'New appointment request from John Doe for tomorrow',
              time: '2025-04-14T08:30:00Z',
              isRead: false,
            },
            {
              id: 'n2',
              type: 'payment',
              message: 'Payment received for appointment #103',
              time: '2025-04-14T07:45:00Z',
              isRead: false,
            },
            {
              id: 'n3',
              type: 'patient',
              message: 'New patient registration: Maria Wilson',
              time: '2025-04-13T22:10:00Z',
              isRead: true,
            },
          ]);

          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-800',
  };

  const appointmentTypeIcons = {
    in_clinic: <User className="h-5 w-5" />,
    tele_consultation: <Video className="h-5 w-5" />,
    home_visit: <Home className="h-5 w-5" />,
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPatients || 0}</div>
            <div className="text-xs text-green-600 flex items-center mt-1">
              <span className="bg-green-100 text-green-800 text-xs font-medium rounded px-1 py-0.5">
                +{stats?.newPatients || 0} new
              </span>
              <span className="ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAppointments || 0}</div>
            <div className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium rounded px-1 py-0.5">
                {stats?.completedAppointments || 0} completed
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalEarnings || 0)}</div>
            <div className="text-xs text-green-600 flex items-center mt-1">
              <span className="bg-green-100 text-green-800 text-xs font-medium rounded px-1 py-0.5">
                {formatCurrency(stats?.earningsThisMonth || 0)}
              </span>
              <span className="ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {stats?.averageRating || 0}
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 ml-1" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Based on {stats?.totalReviews || 0} reviews
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Earnings</CardTitle>
            <CardDescription>Your earnings over the past 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyEarningsData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={value => formatCurrency(value as number)}
                    labelFormatter={label => `Month: ${label}`}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Types</CardTitle>
            <CardDescription>Distribution of your appointment types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentTypesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {appointmentTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={value => `${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>
                Your schedule for {formatDate(new Date().toString(), 'EEEE, MMMM d, yyyy')}
              </CardDescription>
            </div>
            <Link to="/schedule">
              <Button className="mt-2 md:mt-0">
                <Calendar className="h-4 w-4 mr-2" />
                Manage Schedule
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="font-medium text-lg">No Appointments Today</h3>
              <p className="text-muted-foreground mt-1 max-w-md">
                You don't have any appointments scheduled for today. Enjoy your day!
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {todayAppointments.map(appointment => (
                <Card key={appointment.id} className="overflow-hidden border-l-4 border-l-primary">
                  <div className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start">
                        <div className="p-1 rounded-md bg-primary/10 mr-3">
                          {appointmentTypeIcons[appointment.type]}
                        </div>
                        <div>
                          <h3 className="font-medium flex items-center">
                            {formatDate(appointment.scheduledStartTime, 'h:mm a')} -{' '}
                            {formatDate(appointment.scheduledEndTime, 'h:mm a')}
                            <Badge className={cn('ml-2', statusColors[appointment.status])}>
                              {appointment.status
                                .replace('_', ' ')
                                .replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {appointment.type === 'in_clinic'
                              ? 'In-Clinic Visit'
                              : appointment.type === 'tele_consultation'
                              ? 'Video Consultation'
                              : 'Home Visit'}
                            {appointment.clinic && ` at ${appointment.clinic.name}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center mt-3 md:mt-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={appointment.patient.profileImage}
                            alt={`${appointment.patient.firstName} ${appointment.patient.lastName}`}
                          />
                          <AvatarFallback>
                            {appointment.patient.firstName[0]}
                            {appointment.patient.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <div className="font-medium">
                            {appointment.patient.firstName} {appointment.patient.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {appointment.patient.age && `${appointment.patient.age} years`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      {appointment.reason && (
                        <p className="text-sm">
                          <span className="font-medium">Reason:</span> {appointment.reason}
                        </p>
                      )}
                      {appointment.symptoms && (
                        <p className="text-sm">
                          <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm">
                        <span className="font-medium">{formatCurrency(appointment.fee)}</span>
                        <span className="ml-2 text-xs rounded-full px-2 py-0.5 bg-gray-100">
                          {appointment.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Link to={`/patients/${appointment.patient.id}`}>
                          <Button variant="outline" size="sm">
                            View Patient
                          </Button>
                        </Link>
                        <Link to={`/appointments/${appointment.id}`}>
                          <Button size="sm">Start Session</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              <div className="text-center mt-6">
                <Link to="/appointments">
                  <Button variant="outline">View All Appointments</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Patients & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
            <CardDescription>Patients you've seen recently</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {recentPatients.map(patient => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={patient.profileImage}
                          alt={`${patient.firstName} ${patient.lastName}`}
                        />
                        <AvatarFallback>
                          {patient.firstName[0]}
                          {patient.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <div className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {patient.age} years, {patient.gender}
                        </div>
                      </div>
                    </div>
                    <Link to={`/patients/${patient.id}`}>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                ))}
                <div className="mt-4 text-center">
                  <Link to="/my-patients">
                    <Button variant="outline" className="w-full">
                      View All Patients
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your next scheduled appointments</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="font-medium text-lg">No Upcoming Appointments</h3>
                <p className="text-muted-foreground mt-1">
                  You don't have any upcoming appointments scheduled
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map(appointment => (
                  <Card key={appointment.id} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center">
                            <div className="p-1 rounded-md bg-primary/10 mr-2">
                              {appointmentTypeIcons[appointment.type]}
                            </div>
                            <h3 className="font-medium">
                              {formatDate(appointment.scheduledStartTime, 'EEE, MMM d')} ·{' '}
                              {formatDate(appointment.scheduledStartTime, 'h:mm a')}
                            </h3>
                            <Badge className={cn('ml-2', statusColors[appointment.status])}>
                              {appointment.status
                                .replace('_', ' ')
                                .replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          </div>
                          <div className="flex items-center mt-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={appointment.patient.profileImage}
                                alt={`${appointment.patient.firstName} ${appointment.patient.lastName}`}
                              />
                              <AvatarFallback>
                                {appointment.patient.firstName[0]}
                                {appointment.patient.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="ml-2 text-sm">
                              {appointment.patient.firstName} {appointment.patient.lastName}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3 md:mt-0">
                          <Link to={`/appointments/${appointment.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                <div className="text-center mt-4">
                  <Link to="/appointments">
                    <Button variant="outline">View All Appointments</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
