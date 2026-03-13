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
      <div className="register">
        <div className="register__container">
          <div className="register__success">
            <h2>Registration Successful</h2>
            <p>Your registration has been submitted successfully.</p>
            <button
              className="register__submit"
              onClick={() => setSuccess(false)}
            >
              Register Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register">
      <div className="register__container">
        <h1 className="register__title">Register</h1>

        {submitError && (
          <p className="register__error-banner">{submitError}</p>
        )}

        <form className="register__form" onSubmit={handleSubmit} noValidate>
          <div className="register__field">
            <label htmlFor="fullName">Full Name</label>
            <div className="register__input-wrap">
              <svg className="register__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Your full name"
                value={form.fullName}
                onChange={handleChange}
                className={errors.fullName ? 'input--error' : ''}
              />
            </div>
            {errors.fullName && (
              <span className="register__field-error">{errors.fullName}</span>
            )}
          </div>

          <div className="register__field">
            <label htmlFor="institution">Institution Name</label>
            <div className="register__input-wrap">
              <svg className="register__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg>
              <input
                id="institution"
                name="institution"
                type="text"
                placeholder="Your institution"
                value={form.institution}
                onChange={handleChange}
                className={errors.institution ? 'input--error' : ''}
              />
            </div>
            {errors.institution && (
              <span className="register__field-error">
                {errors.institution}
              </span>
            )}
          </div>

          <div className="register__field">
            <label htmlFor="idCard">ID Card (PDF)</label>
            <div className="register__input-wrap">
              <svg className="register__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <input
                id="idCard"
                name="idCard"
                type="file"
                accept=".pdf"
                onChange={handleChange}
                className={errors.idCard ? 'input--error' : ''}
              />
            </div>
            <span className="register__field-note">
              To verify institution
            </span>
            {errors.idCard && (
              <span className="register__field-error">{errors.idCard}</span>
            )}
          </div>

          <div className="register__field">
            <label htmlFor="codeforcesHandle">Codeforces Handle</label>
            <div className="register__input-wrap">
              <svg className="register__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              <input
                id="codeforcesHandle"
                name="codeforcesHandle"
                type="text"
                placeholder="Your Codeforces handle"
                value={form.codeforcesHandle}
                onChange={handleChange}
                className={errors.codeforcesHandle ? 'input--error' : ''}
              />
            </div>
            {errors.codeforcesHandle && (
              <span className="register__field-error">
                {errors.codeforcesHandle}
              </span>
            )}
          </div>

          <div className="register__field">
            <label htmlFor="codechefUsername">CodeChef Username</label>
            <div className="register__input-wrap">
              <svg className="register__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              <input
                id="codechefUsername"
                name="codechefUsername"
                type="text"
                placeholder="Your CodeChef username"
                value={form.codechefUsername}
                onChange={handleChange}
                className={errors.codechefUsername ? 'input--error' : ''}
              />
            </div>
            {errors.codechefUsername && (
              <span className="register__field-error">
                {errors.codechefUsername}
              </span>
            )}
          </div>

          <div className="register__field">
            <label htmlFor="email">Email ID</label>
            <div className="register__input-wrap">
              <svg className="register__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? 'input--error' : ''}
              />
            </div>
            {errors.email && (
              <span className="register__field-error">{errors.email}</span>
            )}
          </div>

          <div className="register__field">
            <label htmlFor="linkedIn">LinkedIn Profile</label>
            <div className="register__input-wrap">
              <svg className="register__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              <input
                id="linkedIn"
                name="linkedIn"
                type="url"
                value={form.linkedIn}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
                className={errors.linkedIn ? 'input--error' : ''}
              />
            </div>
            {errors.linkedIn && (
              <span className="register__field-error">{errors.linkedIn}</span>
            )}
          </div>

          <div className="register__field">
            <label htmlFor="willingToShare">
              Are you willing to share your information with other companies?
            </label>
            <div className="register__input-wrap">
              <svg className="register__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <input
                id="willingToShare"
                name="willingToShare"
                type="text"
                value={form.willingToShare}
                onChange={handleChange}
                placeholder='Type "yes" or "no"'
                className={errors.willingToShare ? 'input--error' : ''}
              />
            </div>
            {errors.willingToShare && (
              <span className="register__field-error">
                {errors.willingToShare}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="register__submit"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
