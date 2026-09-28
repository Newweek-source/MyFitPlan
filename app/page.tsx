'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Form = {
  name: string; age: string; gender: string; height: string; weight: string;
  goal: string; level: string; equipment: string; duration: string;
};

const initial: Form = { name: '', age: '', gender: '', height: '', weight: '', goal: '', level: '', equipment: '', duration: '' };
const quotes = ['Start where you are.', 'Small steps. Stronger you.', 'Consistency beats intensity.', 'Your next version starts today.'];

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(initial);
  const [showAbout, setShowAbout] = useState(false);
  const bmi = useMemo(() => {
    const h = Number(form.height) / 100, w = Number(form.weight);
    if (!h || !w) return null;
    return +(w / (h * h)).toFixed(1);
  }, [form.height, form.weight]);

  const set = (key: keyof Form, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const canContinue = Boolean(
    step === 1 ? form.name.trim() && form.age && form.gender :
    step === 2 ? form.height && form.weight :
    step === 3 ? form.goal :
    step === 4 ? form.level && form.equipment :
    step === 5 ? form.duration :
    false
  );

  function start() { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function next() { if (step < 5) setStep(step + 1); else { localStorage.setItem('myfitplan-profile', JSON.stringify({ ...form, bmi })); setStep(6); } window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function back() { setStep(Math.max(0, step - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function viewFreePlan() { localStorage.setItem('myfitplan-profile', JSON.stringify({ ...form, bmi })); router.push('/plan'); }

  return <main>
    <header className="nav"><div className="brand">MyFit<span>Plan</span></div><div className="navlinks"><button className="products-nav" onClick={() => router.push('/products')}><ProductsIcon/> Products</button><button onClick={() => setShowAbout(true)}>Our Story</button><button onClick={() => setStep(0)}>Home</button></div></header>

    {step === 0 && <section className="hero pagepad">
      <div className="hero-glow" />
      <div className="hero-copy">
        <div className="eyebrow">PERSONALIZED HOME FITNESS</div>
        <h1>Your Personalized<br/>Workout <em>Plan.</em><br/>Free.</h1>
        <p>Tell us about yourself, your goal and how you train. We'll build a weekly workout plan around you.</p>
        <div className="hero-actions"><button className="primary" onClick={start}>Build My Free Plan <b>→</b></button><button className="textbtn" onClick={() => setShowAbout(true)}>How it works</button></div>
        <div className="trust"><span>✓ No gym required</span><span>✓ Personalized</span><span>✓ Printable plan</span></div>
      </div>
      <div className="hero-card">
        <div className="mini-top"><span>MYFITPLAN</span><span>WEEKLY STARTER</span></div>
        <div className="ring"><div><strong>5</strong><small>WORKOUT DAYS</small></div></div>
        <div className="quote">“{quotes[new Date().getDate() % quotes.length]}”</div>
        <div className="fake-bars"><i/><i/><i/><i/><i/><i/><i/></div>
        <div className="fake-labels"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></div>
      </div>
    </section>}

    {step > 0 && step < 6 && <section className="wizard pagepad">
      <div className="wizard-head"><div><span className="eyebrow">YOUR MYFITPLAN</span><h2>Let's build your plan.</h2></div><span className="stepno">0{step} / 05</span></div>
      <div className="progress"><i style={{ width: `${step * 20}%` }}/></div>

      {step === 1 && <div className="question"><h3>Let's get to know you.</h3><p className="sub">A few basics are all we need to start.</p><div className="fields"><label>Name<input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" /></label><label>Age<input type="number" min="13" max="100" value={form.age} onChange={e => set('age', e.target.value)} placeholder="Years" /></label></div><div className="choices"><p>Gender</p><Choice value="Male" current={form.gender} set={v => set('gender', v)} /><Choice value="Female" current={form.gender} set={v => set('gender', v)} /></div></div>}
      {step === 2 && <div className="question"><h3>Let's understand your body.</h3><p className="sub">We'll calculate your BMI automatically.</p><div className="fields"><label>Height<input type="number" value={form.height} onChange={e => set('height', e.target.value)} placeholder="cm" /></label><label>Weight<input type="number" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="kg" /></label></div>{bmi && <div className="bmi"><span>Your BMI</span><strong>{bmi}</strong><small>{bmi < 18.5 ? 'Below typical range' : bmi < 25 ? 'Typical range' : bmi < 30 ? 'Above typical range' : 'Higher range'}</small></div>}</div>}
      {step === 3 && <div className="question"><h3>What do you want to achieve?</h3><p className="sub">Choose the goal that matters most right now.</p><div className="gridchoices">{[['💪','Muscle Gain'],['🔥','Fat Loss'],['⚖️','Weight Management'],['🏃','Athletic Fitness'],['🧘','General Fitness']].map(([icon,v]) => <button className={form.goal===v?'choice active':'choice'} key={v} onClick={() => set('goal', v)}><span>{icon}</span>{v}</button>)}</div></div>}
      {step === 4 && <div className="question"><h3>How do you train?</h3><p className="sub">We'll keep the plan realistic for your current level.</p><p className="group-title">Fitness level</p><div className="gridchoices three">{['Beginner','Intermediate','Advanced'].map(v => <button className={form.level===v?'choice active':'choice'} key={v} onClick={() => set('level', v)}>{v}</button>)}</div><p className="group-title">Equipment</p><div className="gridchoices three">{['No equipment','Basic equipment','Full equipment'].map(v => <button className={form.equipment===v?'choice active':'choice'} key={v} onClick={() => set('equipment', v)}>{v}</button>)}</div></div>}
      {step === 5 && <div className="question"><h3>How much time can you give?</h3><p className="sub">Consistency starts with a routine you can actually follow.</p><p className="group-title">Workout duration</p><div className="gridchoices three">{['20–30 min','30–45 min','45–60 min'].map(v => <button className={form.duration===v?'choice active':'choice'} key={v} onClick={() => set('duration', v)}>{v}</button>)}</div><div className="note"><strong>Diet plans are currently not included.</strong><span>We're keeping V1 focused on a high-quality personalized home workout plan.</span></div></div>}

      <div className="wizard-actions"><button className="back" onClick={back}>← Back</button><button className="primary" disabled={!canContinue} onClick={next}>{step === 5 ? 'See My Plan →' : 'Continue →'}</button></div>
    </section>}

    {step === 6 && <section className="preview pagepad"><div className="preview-glow"/><div className="eyebrow">YOUR FREE PLAN IS READY</div><h2>Built for <em>{form.name}</em>.</h2><p className="sub">Here&apos;s your personalized weekly workout plan, built from your answers.</p><div className="summary"><div><span>GOAL</span><strong>{form.goal}</strong></div><div><span>LEVEL</span><strong>{form.level}</strong></div><div><span>TRAINING</span><strong>{form.equipment}</strong></div><div><span>TIME</span><strong>{form.duration}</strong></div></div><div className="unlock"><span>PERSONALIZED WEEKLY WORKOUT PLAN</span><strong>Free</strong><p>Your plan and printable guide are ready.</p><button className="primary big" onClick={viewFreePlan}>View My Free Plan <b>→</b></button></div><button className="back center" onClick={back}>← Edit my answers</button></section>}

    {showAbout && <div className="modal" onClick={() => setShowAbout(false)}><div className="modal-card" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setShowAbout(false)}>×</button><span className="eyebrow">OUR STORY</span><h2>Fitness shouldn't feel complicated.</h2><p>MyFitPlan is built around one simple idea: your workout should fit your goal, fitness level, available time and equipment.</p><p>Answer a few questions. Get a structured weekly home workout starter plan. Print it and start.</p><button className="primary" onClick={() => { setShowAbout(false); start(); }}>Build My Plan →</button></div></div>}
  </main>;
}

function ProductsIcon() {
  return <svg className="products-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5 12 4l8 4.5v9L12 22l-8-4.5v-9Z"/><path d="M4.5 8.7 12 13l7.5-4.3M12 13v9"/></svg>;
}

function Choice({ value, current, set }: { value: string; current: string; set: (v: string) => void }) {
  return <button className={current===value?'choice active':'choice'} onClick={() => set(value)}>{value}</button>;
}
