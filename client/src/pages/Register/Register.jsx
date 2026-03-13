import { useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { uploadFile } from '../../services/storageService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  User,
  Building2,
  FileText,
  Code2,
  Layers,
  Mail,
  Link,
  Shield,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import './Register.css';

const INITIAL_FORM = {
  fullName: '',
  institution: '',
  idCard: null,
  codeforcesHandle: '',
  codechefUsername: '',
  email: '',
  linkedIn: '',
  willingToShare: '',
};

function validate(form) {
  const errors = {};

  if (!form.fullName.trim()) errors.fullName = 'Full name is required';
  if (!form.institution.trim()) errors.institution = 'Institution is required';

  if (!form.idCard) {
    errors.idCard = 'ID card PDF is required';
  } else {
    if (form.idCard.type !== 'application/pdf')
      errors.idCard = 'Only PDF files are accepted';
    else if (form.idCard.size > 5 * 1024 * 1024)
      errors.idCard = 'File must be under 5MB';
  }

  if (!form.codeforcesHandle.trim())
    errors.codeforcesHandle = 'Codeforces handle is required';
  if (!form.codechefUsername.trim())
    errors.codechefUsername = 'CodeChef username is required';

  if (!form.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (!form.linkedIn.trim()) {
    errors.linkedIn = 'LinkedIn profile is required';
  } else if (!form.linkedIn.trim().includes('linkedin.com')) {
    errors.linkedIn = 'Must be a valid LinkedIn URL';
  }

  if (!form.willingToShare.trim()) {
    errors.willingToShare = 'This field is required';
  } else if (
    !['yes', 'no'].includes(form.willingToShare.trim().toLowerCase())
  ) {
    errors.willingToShare = 'Please type "yes" or "no"';
  }

  return errors;
}

function FieldIcon({ icon: Icon }) {
  return (
    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
      <Icon size={16} />
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1 ml-1">{message}</p>;
}

function Register() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] || null : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    setSuccess(false);

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      // Duplicate check
      const regRef = collection(db, 'registrations');
      const q = query(
        regRef,
        where('email', '==', form.email.trim()),
        where('fullName', '==', form.fullName.trim())
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        setSubmitError('You are already registered');
        setLoading(false);
        return;
      }

      // Upload PDF
      const path = `id-cards/${Date.now()}_${form.idCard.name}`;
      const idCardUrl = await uploadFile(path, form.idCard);

      // Write to Firestore
      await addDoc(regRef, {
        fullName: form.fullName.trim(),
        institution: form.institution.trim(),
        idCardUrl,
        codeforcesHandle: form.codeforcesHandle.trim(),
        codechefUsername: form.codechefUsername.trim(),
        email: form.email.trim(),
        linkedIn: form.linkedIn.trim(),
        willingToShare: form.willingToShare.trim().toLowerCase(),
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setForm(INITIAL_FORM);
      // Reset file input
      const fileInput = document.getElementById('idCard');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="register min-h-screen flex items-center justify-center bg-black px-4 py-12 font-serif">
        <Card className="w-full max-w-lg border-zinc-800 animate-in">
          <CardContent className="flex flex-col items-center text-center py-12 px-8">
            <CheckCircle2 size={48} className="text-emerald-400 mb-4" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Registration Successful
            </h2>
            <p className="text-zinc-400 mb-8">
              Your registration has been submitted successfully.
            </p>
            <Button size="lg" onClick={() => setSuccess(false)}>
              Register Another
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="register min-h-screen flex items-center justify-center bg-black px-4 py-12 font-serif">
      <Card className="w-full max-w-2xl border-zinc-800 animate-in">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent">
            Register
          </CardTitle>
          <CardDescription>
            Fill in the details below to register for the competition
          </CardDescription>
        </CardHeader>

        <CardContent>
          {submitError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-6">
              <AlertCircle size={16} className="shrink-0" />
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <FieldIcon icon={User} />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={form.fullName}
                  onChange={handleChange}
                  className={`pl-10 ${errors.fullName ? 'border-red-500 focus-visible:ring-red-500/40' : ''}`}
                />
              </div>
              <FieldError message={errors.fullName} />
            </div>

            {/* Institution */}
            <div className="space-y-2">
              <Label htmlFor="institution">Institution Name</Label>
              <div className="relative">
                <FieldIcon icon={Building2} />
                <Input
                  id="institution"
                  name="institution"
                  type="text"
                  placeholder="Your institution"
                  value={form.institution}
                  onChange={handleChange}
                  className={`pl-10 ${errors.institution ? 'border-red-500 focus-visible:ring-red-500/40' : ''}`}
                />
              </div>
              <FieldError message={errors.institution} />
            </div>

            {/* ID Card (PDF) */}
            <div className="space-y-2">
              <Label htmlFor="idCard">ID Card (PDF)</Label>
              <div className="relative">
                <FieldIcon icon={FileText} />
                <input
                  id="idCard"
                  name="idCard"
                  type="file"
                  accept=".pdf"
                  onChange={handleChange}
                  className={`flex h-10 w-full rounded-lg border bg-zinc-900 pl-10 pr-3 py-2 text-sm text-zinc-400 file:border-0 file:bg-zinc-800 file:text-zinc-300 file:text-sm file:font-medium file:mr-3 file:px-3 file:py-0.5 file:rounded-md hover:file:bg-zinc-700 cursor-pointer transition-colors ${errors.idCard ? 'border-red-500' : 'border-zinc-700'}`}
                />
              </div>
              <p className="text-xs text-zinc-500 ml-1 italic">To verify institution</p>
              <FieldError message={errors.idCard} />
            </div>

            {/* Codeforces + CodeChef — two-column on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Codeforces Handle */}
              <div className="space-y-2">
                <Label htmlFor="codeforcesHandle">Codeforces Handle</Label>
                <div className="relative">
                  <FieldIcon icon={Code2} />
                  <Input
                    id="codeforcesHandle"
                    name="codeforcesHandle"
                    type="text"
                    placeholder="Your handle"
                    value={form.codeforcesHandle}
                    onChange={handleChange}
                    className={`pl-10 font-mono ${errors.codeforcesHandle ? 'border-red-500 focus-visible:ring-red-500/40' : ''}`}
                  />
                </div>
                <FieldError message={errors.codeforcesHandle} />
              </div>

              {/* CodeChef Username */}
              <div className="space-y-2">
                <Label htmlFor="codechefUsername">CodeChef Username</Label>
                <div className="relative">
                  <FieldIcon icon={Layers} />
                  <Input
                    id="codechefUsername"
                    name="codechefUsername"
                    type="text"
                    placeholder="Your username"
                    value={form.codechefUsername}
                    onChange={handleChange}
                    className={`pl-10 font-mono ${errors.codechefUsername ? 'border-red-500 focus-visible:ring-red-500/40' : ''}`}
                  />
                </div>
                <FieldError message={errors.codechefUsername} />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email ID</Label>
              <div className="relative">
                <FieldIcon icon={Mail} />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500/40' : ''}`}
                />
              </div>
              <FieldError message={errors.email} />
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <Label htmlFor="linkedIn">LinkedIn Profile</Label>
              <div className="relative">
                <FieldIcon icon={Link} />
                <Input
                  id="linkedIn"
                  name="linkedIn"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={form.linkedIn}
                  onChange={handleChange}
                  className={`pl-10 ${errors.linkedIn ? 'border-red-500 focus-visible:ring-red-500/40' : ''}`}
                />
              </div>
              <FieldError message={errors.linkedIn} />
            </div>

            {/* Willing to Share */}
            <div className="space-y-2">
              <Label htmlFor="willingToShare">
                Are you willing to share your information with other companies?
              </Label>
              <div className="relative">
                <FieldIcon icon={Shield} />
                <Input
                  id="willingToShare"
                  name="willingToShare"
                  type="text"
                  placeholder='Type "yes" or "no"'
                  value={form.willingToShare}
                  onChange={handleChange}
                  className={`pl-10 ${errors.willingToShare ? 'border-red-500 focus-visible:ring-red-500/40' : ''}`}
                />
              </div>
              <FieldError message={errors.willingToShare} />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Register'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Register;
