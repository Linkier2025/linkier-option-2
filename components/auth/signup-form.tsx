'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  surname: string;
  phone: string;
  studentId: string;
  registrationNumber: string;
  faculty: string;
  program: string;
  yearOfStudy: string;
  expectedGraduation: string;
  university: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
};

const universities = [
  'University of Zimbabwe (UZ)',
  'National University of Science and Technology (NUST)',
  'Midlands State University (MSU)',
  'Great Zimbabwe University (GZU)',
  'Zimbabwe Open University (ZOU)',
  'Chinhoyi University of Technology (CUT)',
  'Bindura University of Science Education (BUSE)',
  'Lupane State University (LSU)',
  'Harare Institute of Technology (HIT)',
  'Catholic University in Zimbabwe (CUZ)',
  'Zimbabwe Ezekiel Guti University (ZEGU)',
  'Women\'s University in Africa (WUA)',
  'Solusi University',
  'Africa University',
  'Zimbabwe National Defence University (ZNDU)',
  'Manicaland State University of Applied Sciences (MSUAS)',
  'Gwanda State University (GSU)',
  'Marondera University of Agricultural Sciences and Technology (MUAST)'
];

const faculties = [
  'Agriculture', 'Arts', 'Commerce', 'Education', 'Engineering',
  'Law', 'Medicine', 'Science', 'Social Studies', 'Veterinary Science'
];

const yearsOfStudy = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year+'];

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    surname: '',
    phone: '',
    studentId: '',
    registrationNumber: '',
    faculty: '',
    program: '',
    yearOfStudy: '',
    expectedGraduation: '',
    university: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: 'Parent',
  });

  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            surname: formData.surname,
            full_name: `${formData.firstName} ${formData.surname}`,
            phone: formData.phone,
            role: 'student',
            // Student-specific fields
            student_id: formData.studentId,
            registration_number: formData.registrationNumber,
            faculty: formData.faculty,
            program: formData.program,
            year_of_study: formData.yearOfStudy,
            expected_graduation_date: formData.expectedGraduation,
            university: formData.university,
            emergency_contact_name: formData.emergencyContactName,
            emergency_contact_phone: formData.emergencyContactPhone,
            emergency_contact_relationship: formData.emergencyContactRelationship,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Account created successfully! Please check your email to verify your account.');
        router.push('/student/dashboard');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="surname">Surname *</Label>
          <Input
            id="surname"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>

      <div className="border-t pt-4 mt-6">
        <h3 className="text-lg font-medium mb-4">Academic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID *</Label>
            <Input
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number *</Label>
            <Input
              id="registrationNumber"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="university">University *</Label>
            <Select
              value={formData.university}
              onValueChange={(value) => handleSelectChange('university', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select university" />
              </SelectTrigger>
              <SelectContent>
                {universities.map((university) => (
                  <SelectItem key={university} value={university}>
                    {university}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="faculty">Faculty *</Label>
            <Select
              value={formData.faculty}
              onValueChange={(value) => handleSelectChange('faculty', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select faculty" />
              </SelectTrigger>
              <SelectContent>
                {faculties.map((faculty) => (
                  <SelectItem key={faculty} value={faculty}>
                    {faculty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="program">Program *</Label>
            <Input
              id="program"
              name="program"
              value={formData.program}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearOfStudy">Year of Study *</Label>
            <Select
              value={formData.yearOfStudy}
              onValueChange={(value) => handleSelectChange('yearOfStudy', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {yearsOfStudy.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expectedGraduation">Expected Graduation *</Label>
            <Input
              id="expectedGraduation"
              name="expectedGraduation"
              type="month"
              value={formData.expectedGraduation}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4 mt-6">
        <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Full Name *</Label>
            <Input
              id="emergencyContactName"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone">Phone Number *</Label>
            <Input
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="emergencyContactRelationship">Relationship *</Label>
          <Select
            value={formData.emergencyContactRelationship}
            onValueChange={(value) => handleSelectChange('emergencyContactRelationship', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Parent">Parent</SelectItem>
              <SelectItem value="Guardian">Guardian</SelectItem>
              <SelectItem value="Sibling">Sibling</SelectItem>
              <SelectItem value="Spouse">Spouse</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
}
