<template>
  <div class="landing">
    <nav class="landing-nav">
      <NuxtLink to="/" class="brand"
        ><span class="brand-mark" aria-hidden="true">✳</span>taskly</NuxtLink
      >
      <div class="nav-actions">
        <NuxtLink to="/login">Log in</NuxtLink
        ><NuxtLink to="/app" class="button primary">Open workspace ↗</NuxtLink>
      </div>
    </nav>
    <main class="hero">
      <div class="eyebrow">A FRESH SPACE FOR YOUR EVERYDAY</div>
      <h1>Big ideas.<br />Little steps. <em>Let’s bloom.</em></h1>
      <p>
        Gather your plans, find your flow, and make a little progress.<br />Your next good thing starts with one small task.
      </p>
      <NuxtLink to="/login" class="button primary large"
        >Find your flow <span>↗</span></NuxtLink
      >
      <div class="hero-note">Free to explore · No sign-up needed</div>
      <div class="preview" aria-label="Taskly workspace preview">
        <div class="preview-side">
          <strong>✳ Bloomline</strong><span>▦ All tasks</span
          ><span>Website refresh</span><span>Product launch</span
          ><small>A little progress, every day.</small>
        </div>
        <div class="preview-main">
          <div class="eyebrow">LET’S MAKE IT HAPPEN</div>
          <h2>A little momentum, every day.</h2>
          <div class="preview-columns">
            <div>
              <span>○ To do</span>
              <article>Explore the possibilities<small>design</small></article>
            </div>
            <div>
              <span>◐ In progress</span>
              <article>
                Bring your ideas to life<small>development</small>
              </article>
            </div>
            <div>
              <span>● Done</span>
              <article>Take the first step<small>nice work ✓</small></article>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer>
      Less rush. More room to grow.<span>Made for days like yours · Taskly</span>
    </footer>
  </div>
</template>
