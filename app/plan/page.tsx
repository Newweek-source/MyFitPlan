'use client';

import { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

type Level = 'Beginner' | 'Intermediate' | 'Advanced';
type Equipment = 'No equipment' | 'Basic equipment' | 'Full equipment';
type Category = 'full-body' | 'upper-body' | 'lower-body' | 'core' | 'mobility';
type Goal = 'Muscle Gain' | 'Fat Loss' | 'Weight Management' | 'Athletic Fitness' | 'General Fitness';
type Exercise = { id: string; name: string; category: Category; levels: Level[]; equipment: Equipment[]; pose: string; cue: string; muscles: string; sets: Record<Level, string>; goals: Goal[]; rest: string; beginnerModification: string };
type ExerciseSeed = Omit<Exercise, 'goals' | 'rest' | 'beginnerModification'> & Partial<Pick<Exercise, 'goals' | 'rest' | 'beginnerModification'>>;
type WorkoutDay = { day: number; title: string; focus: string; categories: Category[]; exercises: Exercise[] };

// Original MyFitPlan exercise data, created independently of third-party workout artwork or copy.
const exerciseSeeds: ExerciseSeed[] = [
  { id: 'squat', name: 'Bodyweight Squat', category: 'lower-body', levels: ['Beginner', 'Intermediate', 'Advanced'], equipment: ['No equipment', 'Basic equipment', 'Full equipment'], pose: 'squat', muscles: 'Quads · Glutes', cue: 'Keep your chest tall and drive through your heels.', sets: { Beginner: '3 × 10', Intermediate: '3 × 14', Advanced: '4 × 16' } },
  { id: 'goblet-squat', name: 'Goblet Squat', category: 'lower-body', levels: ['Intermediate', 'Advanced'], equipment: ['Basic equipment', 'Full equipment'], pose: 'squat', muscles: 'Quads · Glutes', cue: 'Hold the weight close and keep your torso upright.', sets: { Beginner: '3 × 8', Intermediate: '3 × 12', Advanced: '4 × 14' } },
  { id: 'pushup', name: 'Push-up', category: 'upper-body', levels: ['Intermediate', 'Advanced'], equipment: ['No equipment', 'Basic equipment', 'Full equipment'], pose: 'pushup', muscles: 'Chest · Shoulders · Triceps', cue: 'Lower under control and keep elbows slightly tucked.', sets: { Beginner: '3 × 6', Intermediate: '3 × 10', Advanced: '4 × 14' } },
  { id: 'incline-pushup', name: 'Incline Push-up', category: 'upper-body', levels: ['Beginner', 'Intermediate'], equipment: ['No equipment', 'Basic equipment', 'Full equipment'], pose: 'pushup', muscles: 'Chest · Shoulders · Triceps', cue: 'Use a stable raised surface and keep your body in one line.', sets: { Beginner: '3 × 8', Intermediate: '3 × 12', Advanced: '4 × 14' } },
  { id: 'row', name: 'Supported Dumbbell Row', category: 'upper-body', levels: ['Beginner', 'Intermediate', 'Advanced'], equipment: ['Basic equipment', 'Full equipment'], pose: 'hinge', muscles: 'Back · Biceps', cue: 'Pull your elbow toward your hip without twisting your body.', sets: { Beginner: '3 × 10/side', Intermediate: '3 × 12/side', Advanced: '4 × 12/side' } },
  { id: 'bridge', name: 'Glute Bridge', category: 'lower-body', levels: ['Beginner', 'Intermediate', 'Advanced'], equipment: ['No equipment', 'Basic equipment', 'Full equipment'], pose: 'bridge', muscles: 'Glutes · Hamstrings', cue: 'Squeeze your glutes at the top without arching your back.', sets: { Beginner: '3 × 12', Intermediate: '3 × 16', Advanced: '4 × 18' } },
  { id: 'lunge', name: 'Reverse Lunge', category: 'lower-body', levels: ['Beginner', 'Intermediate', 'Advanced'], equipment: ['No equipment', 'Basic equipment', 'Full equipment'], pose: 'lunge', muscles: 'Quads · Glutes', cue: 'Step back softly and keep your front knee stable.', sets: { Beginner: '3 × 8/side', Intermediate: '3 × 10/side', Advanced: '4 × 12/side' } },
  { id: 'hinge', name: 'Hip Hinge', category: 'lower-body', levels: ['Beginner', 'Intermediate'], equipment: ['No equipment', 'Basic equipment', 'Full equipment'], pose: 'hinge', muscles: 'Hamstrings · Glutes', cue: 'Send your hips back while keeping your spine long.', sets: { Beginner: '3 × 10', Intermediate: '3 × 14', Advanced: '4 × 16' } },
  { id: 'calf-raise', name: 'Calf Raise', category: 'lower-body', levels: ['Beginner', 'Intermediate', 'Advanced'], equipment: ['No equipment', 'Basic equipment', 'Full equipment'], pose: 'calf', muscles: 'Calves', cue: 'Rise slowly, pause at the top, and lower with control.', sets: { Beginner: '3 × 12', Intermediate: '3 × 18', Advanced: '4 × 20' } },
  { id: 'plank', name: 'Plank', category: 'core', levels: ['Beginner', 'Intermediate', 'Advanced'], equipment: ['No equipment', 'Basic equipment', 'Full equipment'], pose: 'plank', muscles: 'Core · Shoulders', cue: 'Brace your core and keep your hips level.', sets: { Beginner: '3 × 20 sec', Intermediate: '3 × 35 sec', Advanced: '4 × 45 sec' } },
  { id: 'deadbug', name: 'Dead Bug', category: 'core', levels: ['Beginner', 'Intermediate', 'Advanced'], equipment: ['No equipment', 'Basic equipment', 'Full equipment'], pose: 'deadbug', muscles: 'Deep core', cue: 'Move slowly while keeping your lower back controlled.', sets: { Beginner: '3 × 6/side', Intermediate: '3 × 10/side', Advanced: '4 × 12/side' } },
  { id: 'bird-dog', name: 'Bird Dog', category: 'core', levels: ['Beginner', 'Intermediate'], equipment: ['No equipment', 'Basic equipment', 'Full equipment'], pose: 'birddog', muscles: 'Core · Back', cue: 'Reach long without rotating your hips.', sets: { Beginner: '3 × 6/side', Intermediate: '3 × 10/side', Advanced: '4 × 12/side' } },
  { id: 'side-plank', name: 'Side Plank', category: 'core', levels: ['Intermediate', 'Advanced'], equipment: ['No equipment', 'Basic equipment', 'Full equipment'], pose: 'sideplank', muscles: 'Obliques · Shoulders', cue: 'Keep your body stacked and hips lifted.', sets: { Beginner: '2 × 15 sec/side', Intermediate: '3 × 25 sec/side', Advanced: '4 × 35 sec/side' } },
  { id: 'pike-pushup', name: 'Pike Push-up', category: 'upper-body', levels: ['Intermediate', 'Advanced'], equipment: ['No equipment', 'Basic equipment', 'Full equipment'], pose: 'pike', muscles: 'Shoulders · Triceps', cue: 'Move your head toward the floor between your hands.', sets: { Beginner: '3 × 5', Intermediate: '3 × 8', Advanced: '4 × 10' } },
  { id: 'cat-cow', name: 'Cat-Cow', category: 'mobility', levels: ['Beginner', 'Intermediate', 'Advanced'], equipment: ['No equipment', 'Basic equipment', 'Full equipment'], pose: 'catcow', muscles: 'Spine · Hips', cue: 'Move smoothly through your spine with your breath.', sets: { Beginner: '2 × 8', Intermediate: '2 × 10', Advanced: '3 × 10' } },
  { id: 'dynamic-stretch', name: 'Dynamic Lunge Stretch', category: 'mobility', levels: ['Beginner', 'Intermediate', 'Advanced'], equipment: ['No equipment', 'Basic equipment', 'Full equipment'], pose: 'stretch', muscles: 'Hips · Hamstrings', cue: 'Keep the movement slow and comfortably controlled.', sets: { Beginner: '2 × 5/side', Intermediate: '2 × 7/side', Advanced: '3 × 8/side' } },
];

const allGoals: Goal[] = ['Muscle Gain', 'Fat Loss', 'Weight Management', 'Athletic Fitness', 'General Fitness'];
const exerciseDatabase: Exercise[] = exerciseSeeds.map(exercise => ({
  ...exercise,
  goals: exercise.goals ?? allGoals,
  rest: exercise.rest ?? '45–60 sec',
  beginnerModification: exercise.beginnerModification ?? 'Reduce the range of motion, slow the tempo, or use a stable support as needed.',
}));
// Prepared for a future, optional recommendation area. These are labels only: no affiliate URLs or partnerships are implied.
const futureRecommendationCategories = ['Workout mat', 'Resistance bands', 'Adjustable dumbbells', 'Skipping rope', 'Water bottle'] as const;

const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const categoryLabels: Record<Category, string> = { 'full-body': 'Full body', 'upper-body': 'Upper body', 'lower-body': 'Lower body', core: 'Core', mobility: 'Mobility' };
function compatible(exercise: Exercise, level: Level, equipment: Equipment) { return exercise.levels.includes(level) && exercise.equipment.includes(equipment); }
function buildPlan(profile: { goal: string; level: Level; equipment: Equipment; duration: string }): WorkoutDay[] {
  const count = profile.duration === '20–30 min' ? 3 : profile.duration === '30–45 min' ? 4 : 5;
  const priority: Record<Goal, Category[]> = { 'Muscle Gain': ['upper-body', 'lower-body', 'core', 'full-body'], 'Fat Loss': ['full-body', 'lower-body', 'upper-body', 'core'], 'Weight Management': ['full-body', 'core', 'lower-body', 'upper-body'], 'Athletic Fitness': ['lower-body', 'core', 'upper-body', 'full-body'], 'General Fitness': ['full-body', 'upper-body', 'lower-body', 'core'] };
  const available = exerciseDatabase.filter(exercise => compatible(exercise, profile.level, profile.equipment));
  const goal = (profile.goal in priority ? profile.goal : 'General Fitness') as Goal;
  const goalCategories = priority[goal];
  const sessions = [
    { title: 'Full Body Foundation', focus: 'Move well from head to toe', categories: ['full-body', 'lower-body', 'upper-body', 'core'] as Category[] },
    { title: 'Upper Body + Core', focus: 'Build strength and posture', categories: ['upper-body', 'core', 'full-body'] as Category[] },
    { title: 'Lower Body + Core', focus: 'Leg strength and stability', categories: ['lower-body', 'core', 'full-body'] as Category[] },
    { title: 'Movement + Mobility', focus: 'Restore, strengthen, and reset', categories: ['mobility', 'core', 'lower-body'] as Category[] },
    { title: profile.goal === 'Fat Loss' ? 'Full Body Momentum' : 'Full Body Progress', focus: 'Finish your week with purpose', categories: goalCategories },
  ];
  const goalOffset = allGoals.indexOf(goal);
  return sessions.map((session, index) => {
    const picked: Exercise[] = [];
    for (const category of [...session.categories, ...goalCategories]) {
      const candidates = available.filter(exercise => exercise.category === category && exercise.goals.includes(goal) && !picked.some(chosen => chosen.id === exercise.id));
      const candidate = candidates[(goalOffset + index) % candidates.length];
      if (candidate) picked.push(candidate);
      if (picked.length === count) break;
    }
    for (const candidate of available) if (picked.length < count && !picked.some(chosen => chosen.id === candidate.id)) picked.push(candidate);
    return { day: index + 1, ...session, exercises: picked };
  });
}

const atlasPosition: Record<string, string> = { squat: '0% 0%', pushup: '33.333% 0%', bridge: '66.666% 0%', plank: '100% 0%', lunge: '0% 50%', hinge: '33.333% 50%', calf: '66.666% 50%', deadbug: '100% 50%', pike: '0% 100%', birddog: '33.333% 100%', sideplank: '66.666% 100%', stretch: '100% 100%', catcow: '100% 100%' };
function ExerciseVisual({ pose }: { pose: string }) {
  return <div className="exercise-visual atlas-visual" aria-hidden="true" style={{ backgroundPosition: atlasPosition[pose] ?? atlasPosition.squat }} />;
}

export default function Plan() {
  const [profile, setProfile] = useState<any>(null); const [selected, setSelected] = useState(1); const [thanks, setThanks] = useState(false);
  useEffect(() => { const saved = localStorage.getItem('myfitplan-profile'); if (saved) setProfile(JSON.parse(saved)); }, []);
  const plan = useMemo(() => profile ? buildPlan(profile) : [], [profile]);
  const days = useMemo(() => [...plan, { day: 6, title: 'Active Recovery', focus: 'Walk, stretch, recover', categories: [] as Category[], exercises: [] }, { day: 7, title: 'Rest Day', focus: 'Recover and reset', categories: [] as Category[], exercises: [] }], [plan]);
  const selectedDay = useMemo(() => days.find(day => day.day === selected), [days, selected]);
  if (!profile || !selectedDay) return <main className="plan-page pagepad"><h2>Your plan isn't available yet.</h2><a href="/">Build MyFitPlan →</a></main>;
  async function downloadPdf() {
    const sheets = Array.from(document.querySelectorAll<HTMLElement>('.pdf-sheet'));
    if (!sheets.length) return;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    for (const [index, sheet] of sheets.entries()) {
      const canvas = await html2canvas(sheet, { scale: 2, backgroundColor: '#07090d', useCORS: true });
      const image = canvas.toDataURL('image/png');
      if (index) pdf.addPage();
      pdf.addImage(image, 'PNG', 0, 0, pageWidth, pageHeight);
    }
    pdf.save(`MyFitPlan-${profile.name || 'Plan'}.pdf`);
    setThanks(true);
  }
  return <main className="plan-page pagepad">
    <div className="plan-nav"><a className="brand" href="/">MyFit<span>Plan</span></a><div className="plan-nav-actions"><a className="products-nav" href="/products"><ProductsIcon/> Products</a><button className="print" onClick={downloadPdf}>Download Printable Plan ↓</button></div></div>
    <section className="plan-hero"><div><span className="eyebrow">YOUR WEEKLY STARTER PLAN</span><h1>Welcome, {profile.name}.</h1><p>{profile.goal} · {profile.level} · {profile.equipment} · {profile.duration}</p></div><div className="score"><strong>5</strong><span>workout days</span></div></section>
    <section className="start-card card"><div><span className="eyebrow">HOW TO START WORKING OUT</span><h2>Follow this 5-day routine each week.</h2><p>These sessions are selected from MyFitPlan's exercise library to match your goal, level, equipment and available time. Start controlled; form comes before more reps.</p></div><div className="start-points"><span>01 · Warm up 5 min</span><span>02 · Follow the exercises</span><span>03 · Rest 45–90 sec</span><span>04 · Walk/stretch after</span></div></section>
    <section className="weekly card"><div className="card-title"><span>YOUR WEEK</span><small>Choose a day to see its workout</small></div><div className="week-tabs">{days.map(day => <button key={day.day} onClick={() => setSelected(day.day)} className={selected === day.day ? 'week-tab active' : 'week-tab'}><small>{dayNames[day.day - 1]}</small><strong>{day.day}</strong><span>{day.exercises.length ? 'Workout' : day.day === 6 ? 'Recovery' : 'Rest'}</span></button>)}</div></section>
    <section className="selected-workout card">
      <div className="card-title"><span>DAY {selectedDay.day} · {selectedDay.title.toUpperCase()}</span><small>{selectedDay.focus}</small></div>
      {selectedDay.exercises.length ? <><div className="workout-tags">{selectedDay.categories.map(category => <span key={category}>{categoryLabels[category]}</span>)}<span>{profile.duration}</span></div><div className="exercise-grid">{selectedDay.exercises.map(exercise => <article className="exercise-card" key={exercise.id}><ExerciseVisual pose={exercise.pose}/><div className="exercise-copy"><span>{exercise.sets[profile.level as Level]} · Rest {exercise.rest}</span><h3>{exercise.name}</h3><small>{exercise.muscles}</small><p>{exercise.cue}</p><p className="modification"><b>Beginner:</b> {exercise.beginnerModification}</p></div></article>)}</div></> : <div className="recovery"><h2>{selectedDay.title}</h2><p>{selectedDay.focus}. A short walk and gentle mobility are enough today.</p></div>}
    </section>
    <section className="card weekly-summary"><div className="card-title"><span>WEEKLY REFERENCE</span><small>Repeat this structure for your first 4 weeks</small></div><div className="summary-list">{days.map(day => <div key={day.day}><b>0{day.day}</b><span>{day.title}</span><small>{day.exercises.length ? `${day.exercises.length} exercises` : day.day === 6 ? 'Active recovery' : 'Rest'}</small></div>)}</div></section>
    <section className="pdf-only" id="pdf-plan">
      <div className="pdf-cover pdf-sheet"><div className="pdf-brand">MyFit<span>Plan</span></div><div className="eyebrow">YOUR PERSONALIZED STARTER PLAN</div><h1>How to start<br/><em>working out.</em></h1><p>5 workout days · 2 recovery days · Repeat weekly for your first 4 weeks.</p><div className="pdf-profile"><strong>{profile.name}</strong><span>{profile.goal} · {profile.level}</span><span>{profile.equipment} · {profile.duration}</span></div></div>
      <div className="pdf-page pdf-sheet"><div className="pdf-brand">MyFit<span>Plan</span></div><h2>Your weekly structure</h2><div className="pdf-week">{days.map(day => <div key={day.day}><b>0{day.day}</b><span>{dayNames[day.day - 1]}</span><strong>{day.title}</strong></div>)}</div><p className="pdf-intro">Follow the five workout days in order. Saturday is active recovery; Sunday is complete rest.</p><div className="pdf-footer">MyFitPlan · Your body. Your plan. Your journey.</div></div>
      {plan.map(day => <div className="pdf-page pdf-sheet pdf-day-page" key={day.day}><div className="pdf-brand">MyFit<span>Plan</span></div><div className="pdf-day-head"><span>DAY 0{day.day}</span><strong>{day.title}</strong><small>{day.focus}</small></div><div className="pdf-exercises">{day.exercises.map(exercise => <div className="pdf-ex" key={`${day.day}-${exercise.id}`}><ExerciseVisual pose={exercise.pose}/><div><strong>{exercise.name}</strong><span>{exercise.sets[profile.level as Level]} · Rest {exercise.rest}</span><p>{exercise.cue}</p><p>Beginner: {exercise.beginnerModification}</p></div></div>)}</div><div className="pdf-footer">MyFitPlan · Your body. Your plan. Your journey.</div></div>)}
    </section>
    <footer className="plan-footer">MyFitPlan · Your body. Your plan. Your journey.</footer>
    {thanks && <div className="modal" onClick={() => setThanks(false)}><div className="modal-card thanks-card" onClick={event => event.stopPropagation()}><div className="thanks-mark">✓</div><span className="eyebrow">PLAN READY</span><h2>Thank you for choosing MyFitPlan.</h2><p>Your printable plan has been downloaded. Keep showing up — your journey starts with the first workout.</p><button className="primary" onClick={() => setThanks(false)}>Start My Week →</button></div></div>}
  </main>;
}

function ProductsIcon() {
  return <svg className="products-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5 12 4l8 4.5v9L12 22l-8-4.5v-9Z"/><path d="M4.5 8.7 12 13l7.5-4.3M12 13v9"/></svg>;
}
