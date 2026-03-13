import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
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

function pad(n) {
  return String(n).padStart(2, '0');
}

function Landing() {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="landing">
      <Navbar />

      <div className="landing__hero">
        <h1 className="landing__heading">Registrations start at 20 April</h1>

        <div className="landing__timer-wrapper">
          <div className="landing__glow" aria-hidden="true" />

          <div className="landing__timer">
            <div className="landing__unit">
              <span className="landing__number">{pad(time.days)}</span>
              <span className="landing__label">Days</span>
            </div>
            <span className="landing__colon">:</span>
            <div className="landing__unit">
              <span className="landing__number">{pad(time.hours)}</span>
              <span className="landing__label">Hours</span>
            </div>
            <span className="landing__colon">:</span>
            <div className="landing__unit">
              <span className="landing__number">{pad(time.minutes)}</span>
              <span className="landing__label">Mins</span>
            </div>
            <span className="landing__colon">:</span>
            <div className="landing__unit">
              <span className="landing__number">{pad(time.seconds)}</span>
              <span className="landing__label">Secs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
