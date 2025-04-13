// src/pages/dashboard/patient/PatientDashboardPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  //   Calendar,
  //   User,
  RefreshCw,
  AlertCircle,
  Plus,
  //   Activity,
  FileText,
  Star,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate } from '@/lib/utils';
// import { apiService } from '@/lib/api';

// Types for our data
interface AppointmentData {
  id: string;
  type: 'in_clinic' | 'tele_consultation' | 'home_visit';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  scheduledStartTime: string;
  scheduledEndTime: string;
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  clinic?: {
    id: string;
    name: string;
    address: string;
  };
}

interface DoctorData {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string;
  };
  specializations: {
    id: string;
    name: string;
    isPrimary: boolean;
  }[];
  averageRating: number;
  totalRatings: number;
}

interface PrescriptionData {
  id: string;
  createdAt: string;
  doctor: {
    id: string;
    name: string;
  };
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    isBeforeMeal: boolean;
  }[];
}

export default function PatientDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentData[]>([]);
  const [pastAppointments, setPastAppointments] = useState<AppointmentData[]>([]);
  const [myDoctors, setMyDoctors] = useState<DoctorData[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);

  useEffect(() => {
    // In a real implementation, these would be API calls
    // For this example, we'll simulate them with timeouts
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API calls
        setTimeout(() => {
          // Mock data
          setUpcomingAppointments([
            {
              id: '1',
              type: 'in_clinic',
              status: 'confirmed',
              scheduledStartTime: '2025-04-20T10:00:00Z',
              scheduledEndTime: '2025-04-20T10:30:00Z',
              doctor: {
                id: '101',
                firstName: 'Sarah',
                lastName: 'Johnson',
                profileImage: 'https://randomuser.me/api/portraits/women/75.jpg',
              },
              clinic: {
                id: '201',
                name: 'City Health Clinic',
                address: '123 Medical Ave, Suite 500, Wellness City',
              },
            },
            {
              id: '2',
              type: 'tele_consultation',
              status: 'pending',
              scheduledStartTime: '2025-04-25T14:00:00Z',
              scheduledEndTime: '2025-04-25T14:30:00Z',
              doctor: {
                id: '102',
                firstName: 'Michael',
                lastName: 'Chen',
                profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
              },
            },
          ]);

          setPastAppointments([
            {
              id: '3',
              type: 'in_clinic',
              status: 'completed',
              scheduledStartTime: '2025-04-05T09:00:00Z',
              scheduledEndTime: '2025-04-05T09:30:00Z',
              doctor: {
                id: '101',
                firstName: 'Sarah',
                lastName: 'Johnson',
                profileImage: 'https://randomuser.me/api/portraits/women/75.jpg',
              },
              clinic: {
                id: '201',
                name: 'City Health Clinic',
                address: '123 Medical Ave, Suite 500, Wellness City',
              },
            },
            {
              id: '4',
              type: 'home_visit',
              status: 'completed',
              scheduledStartTime: '2025-03-20T15:00:00Z',
              scheduledEndTime: '2025-03-20T16:00:00Z',
              doctor: {
                id: '103',
                firstName: 'Emily',
                lastName: 'Rodriguez',
                profileImage: 'https://randomuser.me/api/portraits/women/43.jpg',
              },
            },
          ]);

          setMyDoctors([
            {
              id: '101',
              user: {
                id: 'u101',
                firstName: 'Sarah',
                lastName: 'Johnson',
                profileImage: 'https://randomuser.me/api/portraits/women/75.jpg',
              },
              specializations: [
                {
                  id: 's1',
                  name: 'Cardiology',
                  isPrimary: true,
                },
              ],
              averageRating: 4.9,
              totalRatings: 124,
            },
            {
              id: '102',
              user: {
                id: 'u102',
                firstName: 'Michael',
                lastName: 'Chen',
                profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
              },
              specializations: [
                {
                  id: 's2',
                  name: 'Dermatology',
                  isPrimary: true,
                },
              ],
              averageRating: 4.8,
              totalRatings: 98,
            },
            {
              id: '103',
              user: {
                id: 'u103',
                firstName: 'Emily',
                lastName: 'Rodriguez',
                profileImage: 'https://randomuser.me/api/portraits/women/43.jpg',
              },
              specializations: [
                {
                  id: 's3',
                  name: 'Pediatrics',
                  isPrimary: true,
                },
              ],
              averageRating: 4.9,
              totalRatings: 156,
            },
          ]);

          setPrescriptions([
            {
              id: 'p1',
              createdAt: '2025-04-05T09:30:00Z',
              doctor: {
                id: '101',
                name: 'Dr. Sarah Johnson',
              },
              medications: [
                {
                  name: 'Amoxicillin',
                  dosage: '500mg',
                  frequency: 'Twice daily',
                  duration: '7 days',
                  isBeforeMeal: false,
                },
                {
                  name: 'Ibuprofen',
                  dosage: '400mg',
                  frequency: 'As needed',
                  duration: 'As needed',
                  isBeforeMeal: true,
                },
              ],
            },
            {
              id: 'p2',
              createdAt: '2025-03-20T16:00:00Z',
              doctor: {
                id: '103',
                name: 'Dr. Emily Rodriguez',
              },
              medications: [
                {
                  name: 'Cetirizine',
                  dosage: '10mg',
                  frequency: 'Once daily',
                  duration: '14 days',
                  isBeforeMeal: false,
                },
              ],
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

  //   const appointmentTypeIcons = {
  //     in_clinic: <User className="h-4 w-4 mr-1" />,
  //     tele_consultation: <Activity className="h-4 w-4 mr-1" />,
  //     home_visit: <Calendar className="h-4 w-4 mr-1" />,
  //   };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-sm text-muted-foreground">
              {upcomingAppointments.length === 0
                ? 'No upcoming appointments'
                : `Next: ${formatDate(upcomingAppointments[0]?.scheduledStartTime, 'PPP')}`}
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/appointments">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">My Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{myDoctors.length}</div>
            <p className="text-sm text-muted-foreground">
              Across {new Set(myDoctors.map(d => d.specializations[0]?.name)).size} specialties
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/my-doctors">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{prescriptions.length}</div>
            <p className="text-sm text-muted-foreground">
              {prescriptions.length === 0
                ? 'No active prescriptions'
                : `Last updated: ${formatDate(prescriptions[0]?.createdAt, 'PPP')}`}
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/prescriptions">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Appointments Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>Manage your upcoming and past appointments</CardDescription>
            </div>
            <Link to="/appointment/book">
              <Button className="mt-2 sm:mt-0">
                <Plus className="h-4 w-4 mr-1" />
                Book New
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="font-medium text-lg">No Upcoming Appointments</h3>
                  <p className="text-muted-foreground mt-1">
                    You don't have any upcoming appointments scheduled
                  </p>
                  <Link to="/appointment/book">
                    <Button className="mt-4">Book an Appointment</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map(appointment => (
                    <Card key={appointment.id} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/4 bg-gray-50 p-4 flex flex-col justify-center items-center text-center">
                          <p className="text-lg font-medium">
                            {formatDate(appointment.scheduledStartTime, 'E, MMM d')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(appointment.scheduledStartTime, 'h:mm a')} -{' '}
                            {formatDate(appointment.scheduledEndTime, 'h:mm a')}
                          </p>
                        </div>
                        <div className="sm:w-3/4 p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">
                                Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {appointment.type === 'in_clinic'
                                  ? 'In-Clinic Visit'
                                  : appointment.type === 'tele_consultation'
                                  ? 'Video Consultation'
                                  : 'Home Visit'}
                              </p>
                            </div>
                            <Badge className={cn(statusColors[appointment.status])}>
                              {appointment.status
                                .replace('_', ' ')
                                .replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          </div>

                          {appointment.clinic && (
                            <div className="mt-2 text-sm">
                              <span className="font-medium">Location:</span>{' '}
                              {appointment.clinic.name}
                            </div>
                          )}

                          <div className="mt-4 flex justify-end space-x-2">
                            <Link to={`/appointments/${appointment.id}`}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                            {appointment.type === 'tele_consultation' &&
                              appointment.status === 'confirmed' && (
                                <Link to={`/consultations/${appointment.id}`}>
                                  <Button size="sm">Join Call</Button>
                                </Link>
                              )}
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
            </TabsContent>

            <TabsContent value="past">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : pastAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="font-medium text-lg">No Past Appointments</h3>
                  <p className="text-muted-foreground mt-1">You don't have any past appointments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastAppointments.map(appointment => (
                    <Card key={appointment.id} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/4 bg-gray-50 p-4 flex flex-col justify-center items-center text-center">
                          <p className="text-lg font-medium">
                            {formatDate(appointment.scheduledStartTime, 'E, MMM d')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(appointment.scheduledStartTime, 'h:mm a')} -{' '}
                            {formatDate(appointment.scheduledEndTime, 'h:mm a')}
                          </p>
                        </div>
                        <div className="sm:w-3/4 p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">
                                Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {appointment.type === 'in_clinic'
                                  ? 'In-Clinic Visit'
                                  : appointment.type === 'tele_consultation'
                                  ? 'Video Consultation'
                                  : 'Home Visit'}
                              </p>
                            </div>
                            <Badge className={cn(statusColors[appointment.status])}>
                              {appointment.status
                                .replace('_', ' ')
                                .replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          </div>

                          {appointment.status === 'completed' && (
                            <div className="mt-2 flex space-x-2">
                              <Link to={`/prescriptions?appointmentId=${appointment.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-gray-700"
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  View Prescription
                                </Button>
                              </Link>
                              <Link to={`/review/create/${appointment.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-gray-700"
                                >
                                  <Star className="h-4 w-4 mr-1" />
                                  Leave Review
                                </Button>
                              </Link>
                            </div>
                          )}

                          <div className="mt-4 flex justify-end">
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* My Doctors Section */}
      <Card>
        <CardHeader>
          <CardTitle>My Doctors</CardTitle>
          <CardDescription>Your healthcare professionals</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {myDoctors.slice(0, 3).map(doctor => (
                <Card key={doctor.id} className="overflow-hidden">
                  <div className="p-4 text-center">
                    <div className="relative mx-auto w-20 h-20 mb-3">
                      <img
                        src={doctor.user.profileImage}
                        alt={`Dr. ${doctor.user.firstName} ${doctor.user.lastName}`}
                        className="rounded-full w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-medium">
                      Dr. {doctor.user.firstName} {doctor.user.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {doctor.specializations[0]?.name || 'Specialist'}
                    </p>
                    <div className="flex items-center justify-center mt-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="ml-1 font-medium">{doctor.averageRating}</span>
                      <span className="ml-1 text-gray-500">({doctor.totalRatings} reviews)</span>
                    </div>
                    <div className="mt-4 flex justify-center space-x-2">
                      <Link to={`/doctors/${doctor.id}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
                      <Link to={`/appointment/book/${doctor.id}`}>
                        <Button size="sm">Book</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <div className="text-center mt-6">
            <Link to="/my-doctors">
              <Button variant="outline">View All Doctors</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Prescriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Prescriptions</CardTitle>
          <CardDescription>Your latest medications</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium text-lg">No Prescriptions</h3>
              <p className="text-muted-foreground mt-1">You don't have any prescriptions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map(prescription => (
                <Card key={prescription.id}>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">
                          Prescription from {prescription.doctor.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(prescription.createdAt, 'PPP')}
                        </p>
                      </div>
                      <Link to={`/prescriptions/${prescription.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-sm font-medium mb-2">Medications:</h4>
                      <ul className="space-y-2">
                        {prescription.medications.map((med, index) => (
                          <li key={index} className="text-sm">
                            <span className="font-medium">{med.name}</span> - {med.dosage},{' '}
                            {med.frequency},{med.isBeforeMeal ? ' before meals' : ' after meals'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
              <div className="text-center mt-4">
                <Link to="/prescriptions">
                  <Button variant="outline">View All Prescriptions</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
