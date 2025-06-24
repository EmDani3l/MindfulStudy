export async function saveScheduleToBackend({ schedule, subjects, studyTime }) {
  try {
    const res = await fetch('http://localhost:5000/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: 'demo-user',
        schedule,
        subjects,
        studyTime,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to save');
    }

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}
