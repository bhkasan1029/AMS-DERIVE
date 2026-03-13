import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import ParticleCountdown from '../../components/ParticleCountdown';
import './Landing.css';

const now = new Date();
let targetYear = now.getFullYear();
const tentative = new Date(targetYear, 3, 20, 9, 0, 0);
if (tentative.getTime() <= now.getTime()) targetYear += 1;
const TARGET = new Date(targetYear, 3, 20, 9, 0, 0).getTime();

function getTimeLeft() {
  const diff = TARGET - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function Landing() {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="landing">
      <div className="landing__particles">
        <ParticleCountdown time={time} />
      </div>

      <Navbar />

      <div className="landing__overlay">
        <h1 className="landing__heading">Registrations start at 20 April</h1>
      </div>
    </div>
  );
}

export default Landing;
