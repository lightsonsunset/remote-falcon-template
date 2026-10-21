// Public, editor-only progress summary. Keep private planning and conversations elsewhere.
// Review before each release; move completed items into CHANGELOG.md and remove them here.
export const updateStatus = {
  reviewed: '2026-10-22',
  inProgress: [{
    title: 'Thanksgiving theme',
    templates: ['Lights on Sunset', 'Compact console'],
    description: 'Adding Thanksgiving styling to both supplied layouts.'
  }, {
    title: 'Australia Day theme',
    templates: ['Lights on Sunset', 'Compact console'],
    description: 'Adding Australia Day styling to both supplied layouts.'
  }],
  plannedThemes: ['US patriotic / Fourth of July', 'Valentine’s Day', 'Anzac Day'],
  themeTemplates: ['Lights on Sunset', 'Compact console'],
  knownIssues: [{
    title: 'Voting song-card layout',
    templates: ['Compact console'],
    status: 'Fix in progress',
    description: 'Song cards may display incorrectly in Voting mode. Voting still works normally, and Jukebox is unaffected. A fix is being tested.'
  }]
};
