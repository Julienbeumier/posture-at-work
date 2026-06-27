import { test, expect, devices } from '@playwright/test'

const BASE = 'https://posture-at-work.vercel.app'

test.use({ ...devices['Pixel 5'] })

// Utilitaire : injecter profil bureau
async function injectBureau(page: any) {
  await page.evaluate(() => {
    localStorage.setItem('paw_firstname', 'Marie')
    localStorage.setItem('paw_job_type', 'bureau')
    localStorage.setItem('paw_age', '26-35')
    sessionStorage.setItem('postureatwork_scores', JSON.stringify({
      job_type: 'bureau', global: 52, setup: 28,
      pain: 55, habits: 65, sleep_energy: 60,
      nutrition: 45, lifestyle: 58
    }))
    sessionStorage.setItem('postureatwork_answers', JSON.stringify({
      q1: 'laptop_seul', q3: 'non_trop_bas', q4: 'moins_50cm',
      q5b: 'chaise_fixe', q6: 3, q7: 2, q8: 2, q9: 1,
      q13: 9, q14: 'jamais', q17: 6, q18: 'fatigue',
      q19: 1.5, q20: 'souvent', qn1: 'devant_ecran',
      qn2: 'coup_de_barre', qn3: 'apres_midi', qn4: 'sandwich'
    }))
  })
}

// Utilitaire : injecter profil debout
async function injectDebout(page: any) {
  await page.evaluate(() => {
    localStorage.setItem('paw_firstname', 'Lucas')
    localStorage.setItem('paw_job_type', 'debout')
    sessionStorage.setItem('postureatwork_scores', JSON.stringify({
      job_type: 'debout', global: 38, setup: 22,
      pain: 30, habits: 50, sleep_energy: 45,
      nutrition: 40, lifestyle: 45
    }))
    sessionStorage.setItem('postureatwork_answers_debout', JSON.stringify({
      q_d1: 'dur', q_d2: 'non', q_d3: 'ville',
      q_d4: 9, q_d5: 'non_fixe', q_d6: 'non',
      q_d7: 'trop_bas', q_d8: 3, q_d9: 2,
      q_d10: 3, q_d11: 3, q_d13: 'premier_pas',
      q_d14: 'tres_lourdes', q_d16: 'jamais',
      q_d17: 'fixe_immobile', q_d_crampes: 'souvent',
      q_d_gonflement: 'nettement_gonfles',
      q_d_petit_dej: 'saute', q_d_etirements_routine: 'jamais'
    }))
  })
}

// ━━━ LANDING ━━━
test('Landing — desktop et mobile', async ({ page }) => {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')

  await page.screenshot({
    path: 'audit/01_landing_full.png',
    fullPage: true
  })

  const h1 = await page.textContent('h1')
  const ctaHref = await page.getAttribute(
    'text=Commencer mon bilan gratuit', 'href'
  )
  const footer = await page.textContent('footer')

  console.log('=== LANDING ===')
  console.log('H1:', h1)
  console.log('CTA principal href:', ctaHref)
  console.log('Footer texte:', footer?.trim().substring(0, 200))

  const btnPrimary = page.locator('text=Commencer mon bilan').first()
  const btnExample = page.locator('text=Voir un exemple').first()
  console.log('Bouton primaire visible:', await btnPrimary.isVisible())
  console.log('Bouton exemple visible:', await btnExample.isVisible())

  const navLinks = await page.$$eval('nav a', (links: any[]) =>
    links.map(l => ({ text: l.textContent?.trim(), href: l.href }))
  )
  console.log('Nav links:', JSON.stringify(navLinks, null, 2))
})

// ━━━ ONBOARDING ━━━
test('Onboarding — flow complet', async ({ page }) => {
  await page.goto(BASE + '/onboarding')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: 'audit/02_onboarding_step1.png' })

  const input = page.locator('input[type="text"]').first()
  if (await input.isVisible()) {
    await input.fill('Marie')
    await page.screenshot({ path: 'audit/03_onboarding_prenom.png' })
    await page.locator('text=Suivant').click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'audit/04_onboarding_step2.png' })
  }

  const steps = await page.$$eval(
    '[class*="step"], [class*="question"]',
    (els: any[]) => els.map(e => e.textContent?.trim())
  )
  console.log('=== ONBOARDING ===')
  console.log('Étapes visibles:', steps)

  const cards = await page.$$eval(
    '[class*="card"], button, [role="button"]',
    (els: any[]) => els.map(e => e.textContent?.trim()).filter((t: any) => t && t.length < 100)
  )
  console.log('Cards/boutons:', cards)
})

// ━━━ QUESTIONNAIRE BUREAU ━━━
test('Questionnaire bureau — structure', async ({ page }) => {
  await page.goto(BASE)
  await page.evaluate(() => {
    localStorage.setItem('paw_job_type', 'bureau')
    localStorage.setItem('paw_firstname', 'Marie')
  })
  await page.goto(BASE + '/questionnaire')
  await page.waitForLoadState('networkidle')
  await page.screenshot({
    path: 'audit/05_questionnaire_bureau.png',
    fullPage: true
  })

  const questions = await page.$$eval(
    '[class*="question"], h3, h4',
    (els: any[]) => els.map(e => e.textContent?.trim()).filter(Boolean)
  )
  console.log('=== QUESTIONNAIRE BUREAU ===')
  console.log('Nombre de questions trouvées:', questions.length)
  console.log('Questions:', questions.slice(0, 20))

  const categories = await page.$$eval(
    '[class*="category"], [class*="section"]',
    (els: any[]) => els.map(e => e.textContent?.trim().substring(0, 50))
  )
  console.log('Catégories:', categories)

  const btn = page.locator('text=Voir mes résultats')
  console.log('Bouton résultats visible:', await btn.isVisible())
})

// ━━━ QUESTIONNAIRE DEBOUT ━━━
test('Questionnaire debout — questions spécifiques', async ({ page }) => {
  await page.goto(BASE)
  await page.evaluate(() => {
    localStorage.setItem('paw_job_type', 'debout')
    localStorage.setItem('paw_firstname', 'Lucas')
  })
  await page.goto(BASE + '/questionnaire')
  await page.waitForLoadState('networkidle')
  await page.screenshot({
    path: 'audit/06_questionnaire_debout.png',
    fullPage: true
  })

  const questions = await page.$$eval(
    '[class*="question"], h3, h4, label',
    (els: any[]) => els.map(e => e.textContent?.trim()).filter(Boolean)
  )
  console.log('=== QUESTIONNAIRE DEBOUT ===')
  console.log('Questions debout:', questions.slice(0, 30))

  const pageContent = await page.textContent('body')
  const hasDeboutQuestions = [
    'sol', 'tapis', 'chaussures', 'debout', 'pieds'
  ].some(kw => pageContent?.toLowerCase().includes(kw))
  console.log('Questions debout spécifiques présentes:', hasDeboutQuestions)

  const hasBureauQuestions = [
    'écran', 'laptop', 'clavier', 'souris'
  ].some(kw => pageContent?.toLowerCase().includes(kw))
  console.log('Questions bureau présentes (NE DEVRAIT PAS):', hasBureauQuestions)
})

// ━━━ RÉSULTATS BUREAU ━━━
test('Résultats bureau — contenu et personnalisation', async ({ page }) => {
  await page.goto(BASE)
  await injectBureau(page)
  await page.goto(BASE + '/results')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  await page.screenshot({
    path: 'audit/07_results_bureau.png',
    fullPage: true
  })

  const body = await page.textContent('body')
  console.log('=== RÉSULTATS BUREAU ===')

  const scoreMatch = body?.match(/\b5[0-9]\b/)
  console.log('Score affiché (regex body):', scoreMatch?.[0] ?? 'non trouvé')

  console.log('Contient "Marie":', body?.includes('Marie'))

  const dimensions = ['Setup', 'Douleurs', 'Habitudes', 'Sommeil', 'Nutrition']
  dimensions.forEach(d => {
    console.log(`Dimension "${d}" présente:`, body?.includes(d))
  })

  console.log('Recommandations présentes:', body?.includes('recommandation') || body?.includes('priorité'))
  console.log('Liens Amazon présents:', body?.includes('amzn') || body?.includes('amazon'))
  console.log('CTA vidéo présent:', body?.includes('vidéo') || body?.includes('Affiner'))

  const conseilsLinks = await page.$$eval(
    'a[href*="conseils"]',
    (links: any[]) => links.map(l => l.href)
  )
  console.log('Liens vers conseils:', conseilsLinks)
})

// ━━━ RÉSULTATS DEBOUT ━━━
test('Résultats debout — contenu spécifique', async ({ page }) => {
  await page.goto(BASE)
  await injectDebout(page)
  await page.goto(BASE + '/results')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  await page.screenshot({
    path: 'audit/08_results_debout.png',
    fullPage: true
  })

  const body = await page.textContent('body')
  console.log('=== RÉSULTATS DEBOUT ===')
  console.log('Contient "Lucas":', body?.includes('Lucas'))

  const deboutKeywords = ['debout', 'pieds', 'mollets', 'tapis', 'jambes']
  deboutKeywords.forEach(kw => {
    console.log(`Keyword debout "${kw}":`, body?.toLowerCase().includes(kw))
  })

  const bureauKeywords = ['écran', 'laptop', 'clavier', 'souris']
  bureauKeywords.forEach(kw => {
    console.log(`Keyword bureau "${kw}" (NE DEVRAIT PAS):`, body?.toLowerCase().includes(kw))
  })

  console.log('Tapis anti-fatigue:', body?.includes('tapis'))
  console.log('Semelles:', body?.includes('semelles'))
  console.log('Chaussettes compression:', body?.includes('compression'))
})

// ━━━ CONSEILS BUREAU ━━━
test('Conseils bureau — toutes les dimensions', async ({ page }) => {
  await page.goto(BASE)
  await injectBureau(page)

  const dimensions = ['setup', 'douleurs', 'habitudes', 'sommeil', 'nutrition']

  for (const dim of dimensions) {
    await page.goto(BASE + '/conseils/' + dim)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: `audit/09_conseils_${dim}_bureau.png`,
      fullPage: true
    })

    const body = await page.textContent('body')
    console.log(`\n=== CONSEILS ${dim.toUpperCase()} BUREAU ===`)

    const scoreEl = page.locator('[class*="score"]').first()
    if (await scoreEl.isVisible()) {
      console.log('Score:', await scoreEl.textContent())
    }

    console.log('Actions immédiates:', body?.includes('immédiates') || body?.includes('immédiat'))
    console.log('Exercices:', body?.includes('exercice') || body?.includes('Exercice'))
    console.log('Produits Amazon:', body?.includes('Amazon') || body?.includes('amzn'))
    console.log('Lien mobilité:', body?.includes('mobilite') || body?.includes('Mobilité'))

    if (dim === 'setup') {
      console.log('ERREUR - Contenu debout dans bureau:',
        body?.includes('tapis anti-fatigue') || body?.includes('semelles'))
    }
  }
})

// ━━━ CONSEILS DEBOUT ━━━
test('Conseils debout — toutes les dimensions', async ({ page }) => {
  await page.goto(BASE)
  await injectDebout(page)

  const dimensions = ['setup', 'douleurs', 'habitudes', 'sommeil', 'nutrition']

  for (const dim of dimensions) {
    await page.goto(BASE + '/conseils/' + dim)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: `audit/10_conseils_${dim}_debout.png`,
      fullPage: true
    })

    const body = await page.textContent('body')
    console.log(`\n=== CONSEILS ${dim.toUpperCase()} DEBOUT ===`)

    if (dim === 'setup') {
      console.log('Tapis anti-fatigue:', body?.includes('tapis'))
      console.log('Chaussures:', body?.includes('chaussures'))
      console.log('ERREUR - Écran/laptop:',
        body?.toLowerCase().includes('écran') ||
        body?.toLowerCase().includes('laptop'))
    }

    if (dim === 'douleurs') {
      console.log('Pieds/talons:',
        body?.includes('pieds') || body?.includes('talon'))
      console.log('Mollets:', body?.includes('mollets'))
      console.log('ERREUR - Nuque cervicale bureau:',
        body?.toLowerCase().includes('cervical'))
    }

    if (dim === 'sommeil') {
      console.log('Crampes:', body?.includes('crampes'))
      console.log('Jambes lourdes:', body?.includes('jambes'))
      console.log('ERREUR - Écran le soir:',
        body?.toLowerCase().includes('écran le soir'))
    }

    if (dim === 'nutrition') {
      console.log('Hydratation effort:', body?.includes('hydratation'))
      console.log('Magnésium:', body?.includes('magnésium'))
    }

    console.log('Exercices présents:', body?.includes('Exercice') || body?.includes('exercice'))
    console.log('Produits Amazon:', body?.includes('Amazon'))
  }
})

// ━━━ MOBILITÉ ━━━
test('Mobilité — programmes et exercices', async ({ page }) => {
  await page.goto(BASE + '/mobilite')
  await page.waitForLoadState('networkidle')
  await page.screenshot({
    path: 'audit/12_mobilite.png',
    fullPage: true
  })

  const body = await page.textContent('body')
  console.log('=== MOBILITÉ ===')

  const exercises = [
    'Rétraction cervicale', 'Short foot', 'Cohérence cardiaque',
    'Flexion lombaire', 'Rotation thoracique'
  ]
  exercises.forEach(ex => {
    console.log(`Exercice "${ex}":`, body?.includes(ex))
  })

  console.log('Programme bureau:', body?.includes('bureau') || body?.includes('Bureau'))
  console.log('Programme debout:', body?.includes('debout') || body?.includes('Debout'))
  console.log('Timer/Commencer:', body?.includes('timer') || body?.includes('Commencer'))
})

// ━━━ RESPONSIVE MOBILE ━━━
test('Responsive mobile — points critiques', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })

  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: 'audit/13_mobile_landing.png' })

  const hasOverflow = await page.evaluate(() => {
    return document.body.scrollWidth > window.innerWidth
  })
  console.log('=== RESPONSIVE MOBILE ===')
  console.log('Overflow horizontal landing:', hasOverflow)

  const btnHeight = await page.evaluate(() => {
    const btn = document.querySelector('button, [role="button"]')
    return btn ? (btn as HTMLElement).getBoundingClientRect().height : 0
  })
  console.log('Hauteur bouton (min 44px):', btnHeight)

  await page.goto(BASE)
  await page.evaluate(() => {
    localStorage.setItem('paw_job_type', 'bureau')
    localStorage.setItem('paw_firstname', 'Test')
  })
  await page.goto(BASE + '/questionnaire')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: 'audit/14_mobile_questionnaire.png', fullPage: true })

  const hasOverflowQ = await page.evaluate(() => {
    return document.body.scrollWidth > window.innerWidth
  })
  console.log('Overflow horizontal questionnaire:', hasOverflowQ)

  await page.goto(BASE)
  await injectBureau(page)
  await page.goto(BASE + '/results')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: 'audit/15_mobile_results.png', fullPage: true })
})

// ━━━ PERFORMANCE ━━━
test('Performance — temps de chargement', async ({ page }) => {
  console.log('=== PERFORMANCE ===')

  const pages = ['/', '/onboarding', '/questionnaire', '/results', '/mobilite']

  for (const path of pages) {
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    const start = Date.now()
    await page.goto(BASE + path)
    await page.waitForLoadState('networkidle')
    const time = Date.now() - start
    console.log(`${path}: ${time}ms`)

    if (consoleErrors.length > 0) {
      console.log(`Erreurs console sur ${path}:`, consoleErrors)
    }
  }
})

// ━━━ LIENS BRISÉS ━━━
test('Liens — vérification complète', async ({ page }) => {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')

  const links = await page.$$eval('a[href]', (links: any[]) =>
    links.map(l => ({ text: l.textContent?.trim(), href: l.href }))
      .filter(l => l.href.startsWith('http'))
  )

  console.log('=== LIENS LANDING ===')
  console.log(JSON.stringify(links, null, 2))

  for (const link of links.filter((l: any) => l.href.includes('posture-at-work'))) {
    try {
      const response = await page.goto(link.href)
      const status = response?.status()
      if (status !== 200) {
        console.log(`LIEN BRISÉ: ${link.href} → ${status}`)
      } else {
        console.log(`OK: ${link.href}`)
      }
      await page.goBack()
    } catch (e) {
      console.log(`ERREUR: ${link.href}`)
    }
  }
})

// ━━━ ACCESSIBILITÉ ━━━
test('Accessibilité — points critiques', async ({ page }) => {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')

  console.log('=== ACCESSIBILITÉ ===')

  const imgsNoAlt = await page.$$eval(
    'img:not([alt])',
    (imgs: any[]) => imgs.map(i => i.src)
  )
  console.log('Images sans alt:', imgsNoAlt)

  const btnsNoText = await page.$$eval(
    'button:not([aria-label])',
    (btns: any[]) => btns
      .filter(b => !b.textContent?.trim())
      .map(b => b.outerHTML.substring(0, 100))
  )
  console.log('Boutons sans texte:', btnsNoText)

  const contrastIssues = await page.evaluate(() => {
    const issues: string[] = []
    document.querySelectorAll('p, span, h1, h2, h3').forEach(el => {
      const style = window.getComputedStyle(el)
      const color = style.color
      const bg = style.backgroundColor
      if (color === bg) {
        issues.push(el.textContent?.trim().substring(0, 50) || '')
      }
    })
    return issues
  })
  console.log('Problèmes contraste:', contrastIssues)

  const inputsNoLabel = await page.$$eval(
    'input:not([aria-label]):not([placeholder])',
    (inputs: any[]) => inputs.map(i => i.outerHTML.substring(0, 100))
  )
  console.log('Inputs sans label:', inputsNoLabel)
})
