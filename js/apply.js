document.getElementById('year')?.replaceChildren(document.createTextNode(new Date().getFullYear()));

const applicationForm = document.getElementById('tefula-application');
if (applicationForm) {
  const applicationStatus = document.getElementById('application-status');
  const applicationSubmit = document.getElementById('application-submit');
  const TEFULA_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby1viOdwwZmtvKLSR_loMzr8kKeZwDsbGxeepmL9ujK3ff4pd-YdpQioBfpJEOskLwQqQ/exec';

  applicationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!applicationForm.reportValidity()) return;

    const formData = new FormData(applicationForm);
    const selectedAreas = formData.getAll('preferredTeam');
    if (selectedAreas.length === 0) {
      applicationStatus.textContent = 'Please select at least one area you would like to join.';
      applicationForm.querySelector('.checkbox-field')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const profileNames = ['portfolio', 'github', 'linkedin'];
    const profileValues = profileNames.map(name => String(formData.get(name) || '').trim());
    if (!profileValues.some(Boolean)) {
      applicationStatus.textContent = 'Please add at least one profile link: portfolio, GitHub, or LinkedIn.';
      document.getElementById('profile-links')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const normalizedProfiles = profileValues.map(value => value && (/^https?:\/\//i.test(value) ? value : 'https://' + value));
    const payload = Object.fromEntries(formData.entries());
    payload.preferredTeam = selectedAreas.join(', ');
    payload.portfolio = normalizedProfiles[0] || '';
    payload.github = normalizedProfiles[1] || '';
    payload.linkedin = normalizedProfiles[2] || '';
    payload.profileLinks = normalizedProfiles.filter(Boolean).join(', ');
    payload.consent = applicationForm.elements.consent.checked;

    applicationSubmit.disabled = true;
    applicationSubmit.textContent = 'Submitting…';
    applicationStatus.textContent = 'Submitting your application…';

    try {
      const response = await fetch(TEFULA_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Submission failed');
      applicationForm.reset();
      applicationStatus.textContent = 'Thank you! Your application has been received by TEFULA.';
    } catch (error) {
      applicationStatus.textContent = 'We could not confirm your submission. Please check the response sheet before retrying, or contact virtualtefula@gmail.com.';
    } finally {
      applicationSubmit.disabled = false;
      applicationSubmit.innerHTML = 'Submit application <span aria-hidden="true">↗</span>';
    }
  });
}
