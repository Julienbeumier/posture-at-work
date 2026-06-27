import { test } from '@playwright/test'

const BASE_URL = 'https://posture-at-work.vercel.app'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROFIL 1 — BUREAU
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
test('Profil bureau — flow complet', async ({ page }) => {

  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: 'tests/screenshots/01_landing.png', fullPage: true })

  await page.goto(BASE_URL + '/onboarding')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: 'tests/screenshots/02_onboarding.png', fullPage: true })

  // Inject bureau session data
  await page.evaluate(() => {
    localStorage.setItem('paw_firstname', 'Marie')
    localStorage.setItem('paw_job_type', 'bureau')
    localStorage.setItem('paw_age', '26-35')
    localStorage.setItem('paw_hours_week', '35-40h')

    const scores = {
      job_type: 'bureau',
      global: 52,
      setup: 28,
      pain: 55,
      habits: 65,
      sleep_energy: 60,
      nutrition: 45,
      lifestyle: 58,
    }
    sessionStorage.setItem('postureatwork_scores', JSON.stringify(scores))

    const answers = {
      q1: 'laptop',
      q2: 'remote',
      q3: 'no',
      q4: 'close',
      q5: 'trackpad',
      q5b: 'fixed',
      q5c: 'none_needed',
      q6: 3, q7: 2, q8: 2, q9: 1, q10: 2,
      q11: 'months',
      q12: 'end',
      q12b: 'partial',
      q13: 9,
      q14: 'never',
      q14b: 'cardio',
      q15: 'hand',
      q17: 6,
      q18: 'tired',
      q19: 1.5,
      q20: 'often',
      q21: ['none'],
      q21_other: '',
      q22: '1x',
      q23: 'never',
      q24: 'bad',
      q25: 2,
      qn1: 'screen',
      qn2: 'crash',
      qn3: 'afternoon',
      qn4: 'sandwich',
    }
    sessionStorage.setItem('postureatwork_answers', JSON.stringify(answers))
  })

  await page.goto(BASE_URL + '/results')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'tests/screenshots/04_results_bureau.png', fullPage: true })

  for (const dim of ['setup', 'douleurs', 'sommeil', 'nutrition', 'habitudes', 'lifestyle']) {
    await page.goto(BASE_URL + '/conseils/' + dim)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)
    const idx = { setup: '05', douleurs: '06', sommeil: '07', nutrition: '08', habitudes: '08b', lifestyle: '08c' }[dim]
    await page.screenshot({ path: `tests/screenshots/${idx}_conseils_${dim}_bureau.png`, fullPage: true })
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROFIL 2 — DEBOUT commerce
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
test('Profil debout — flow complet', async ({ page }) => {

  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle')

  await page.evaluate(() => {
    localStorage.setItem('paw_firstname', 'Lucas')
    localStorage.setItem('paw_job_type', 'debout')

    const scores = {
      job_type: 'debout',
      global: 45,
      setup: 25,
      pain: 40,
      habits: 55,
      sleep_energy: 50,
      nutrition: 45,
      lifestyle: 55,
    }
    sessionStorage.setItem('postureatwork_scores', JSON.stringify(scores))

    const answers = {
      q_d1: 'dur',
      q_d2: 'non',
      q_d3: 'ville',
      q_d4: 9,
      q_d5: 'non',
      q_d6: 'non',
      q_d7: 'trop_bas',
      q_d8: 3, q_d9: 2, q_d10: 3, q_d11: 3, q_d12: 2,
      q_d13: 'premier_pas',
      q_d14: 'tres_lourdes',
      q_d15: 'mois',
      q_d16: 'jamais',
      q_d17: 'fixe',
      q_d19: 'rarement',
      q_d_matin: 'douleur_premier_pas',
      q_d_gonflement: 'net',
      q_d_varices: 'non',
      q_d_crampes: 'souvent',
      q_d_jambes_nuit: 'parfois',
      q_d_reveil_douleur: 'douleurs_jambes',
      q_d_petit_dej: 'leger',
      q_d_crampes_alim: 'parfois',
      q_d_energie_boisson: 'parfois_soda',
      q_d_repas_service: 'sandwich_assis',
      q_d_etirements_routine: 'jamais',
      q_d_activite_type: ['aucune'],
      q_d_consultation: 'jamais',
      q_d_charges: 'moyennes',
      q_d_repetitif: 'souvent',
      q_d21: 2,
    }
    sessionStorage.setItem('postureatwork_answers_debout', JSON.stringify(answers))
    sessionStorage.removeItem('postureatwork_answers')
  })

  await page.goto(BASE_URL + '/results')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'tests/screenshots/09_results_debout.png', fullPage: true })

  for (const dim of ['setup', 'douleurs', 'sommeil', 'nutrition', 'habitudes', 'lifestyle']) {
    await page.goto(BASE_URL + '/conseils/' + dim)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)
    const idx = { setup: '10', douleurs: '11', sommeil: '12', nutrition: '13', habitudes: '14', lifestyle: '15' }[dim]
    await page.screenshot({ path: `tests/screenshots/${idx}_conseils_${dim}_debout.png`, fullPage: true })
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROFIL 3 — DEBOUT manutention (scores critiques)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
test('Profil debout manutention — douleurs sévères', async ({ page }) => {

  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle')

  await page.evaluate(() => {
    localStorage.setItem('paw_firstname', 'Kevin')
    localStorage.setItem('paw_job_type', 'debout')

    const scores = {
      job_type: 'debout',
      global: 32,
      setup: 15,
      pain: 20,
      habits: 45,
      sleep_energy: 40,
      nutrition: 35,
      lifestyle: 45,
    }
    sessionStorage.setItem('postureatwork_scores', JSON.stringify(scores))

    const answers = {
      q_d1: 'dur',
      q_d2: 'non',
      q_d3: 'securite',
      q_d4: 10,
      q_d5: 'non',
      q_d6: 'non',
      q_d7: 'trop_bas',
      q_d8: 4, q_d9: 3, q_d10: 4, q_d11: 4, q_d12: 3,
      q_d13: 'premier_pas',
      q_d14: 'varices',
      q_d15: 'an',
      q_d16: 'jamais',
      q_d17: 'fixe',
      q_d19: 'interdit',
      q_d_charges: 'tres_lourdes',
      q_d_repetitif: 'toute_la_journee',
      q_d_crampes: 'toutes_les_nuits',
      q_d_gonflement: 'tres_gonfle',
      q_d_varices: 'importantes',
      q_d_matin: 'douleur_reveil',
      q_d_jambes_nuit: 'perturbe_sommeil',
      q_d_reveil_douleur: 'douleurs_importantes',
      q_d_petit_dej: 'saute',
      q_d_crampes_alim: 'nocturnes_service',
      q_d_energie_boisson: 'seul_moyen',
      q_d_repas_service: 'saute_pause',
      q_d_etirements_routine: 'jamais',
      q_d_activite_type: ['aucune'],
      q_d_consultation: 'jamais',
      q_d21: 1,
    }
    sessionStorage.setItem('postureatwork_answers_debout', JSON.stringify(answers))
    sessionStorage.removeItem('postureatwork_answers')
  })

  await page.goto(BASE_URL + '/results')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'tests/screenshots/16_results_manutention.png', fullPage: true })

  await page.goto(BASE_URL + '/conseils/douleurs')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'tests/screenshots/17_conseils_douleurs_manutention.png', fullPage: true })

  await page.goto(BASE_URL + '/conseils/sommeil')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'tests/screenshots/18_conseils_sommeil_manutention.png', fullPage: true })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAGES STATIQUES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
test('Pages statiques', async ({ page }) => {

  await page.goto(BASE_URL + '/mobilite')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'tests/screenshots/20_mobilite.png', fullPage: true })

  await page.goto(BASE_URL + '/dashboard')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'tests/screenshots/21_dashboard.png', fullPage: true })
})
