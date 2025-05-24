// Popup JavaScript
document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('api-key');
  const toggleVisibilityBtn = document.getElementById('toggle-visibility');
  const saveButton = document.getElementById('save-button');
  const statusIndicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');
  const notification = document.getElementById('notification');

  // Load saved API key
  const result = await chrome.storage.local.get(['openrouter_api_key']);
  if (result.openrouter_api_key) {
    apiKeyInput.value = result.openrouter_api_key;
    updateStatus('connected', 'API key configured');
  }

  // Toggle password visibility
  toggleVisibilityBtn.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      toggleVisibilityBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      `;
    } else {
      apiKeyInput.type = 'password';
      toggleVisibilityBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      `;
    }
  });

  // Save API key
  saveButton.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showNotification('Please enter an API key', 'error');
      return;
    }

    // Validate API key format (basic check)
    if (!apiKey.startsWith('sk-or-') && !apiKey.startsWith('sk-')) {
      showNotification('Invalid API key format', 'error');
      return;
    }

    try {
      saveButton.disabled = true;
      saveButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        Saving...
      `;

      // Test the API key
      const isValid = await testApiKey(apiKey);
      
      if (isValid) {
        await chrome.storage.local.set({ openrouter_api_key: apiKey });
        updateStatus('connected', 'API key saved successfully');
        showNotification('API key saved successfully!', 'success');
      } else {
        showNotification('Invalid API key. Please check and try again.', 'error');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      showNotification('Failed to save API key. Please try again.', 'error');
    } finally {
      saveButton.disabled = false;
      saveButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
        Save Settings
      `;
    }
  });

  // Test API key validity
  async function testApiKey(apiKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('API key test failed:', error);
      return false;
    }
  }

  // Update status indicator
  function updateStatus(status, message) {
    const statusDot = statusIndicator.querySelector('.status-dot');
    
    if (status === 'connected') {
      statusDot.classList.add('connected');
      statusText.textContent = message;
      statusText.style.color = '#28a745';
    } else {
      statusDot.classList.remove('connected');
      statusText.textContent = message;
      statusText.style.color = '#dc3545';
    }
  }

  // Show notification
  function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  // Check input validity on type
  apiKeyInput.addEventListener('input', () => {
    const value = apiKeyInput.value.trim();
    if (value) {
      updateStatus('pending', 'Ready to save');
      statusText.style.color = '#ffc107';
    } else {
      updateStatus('disconnected', 'Not configured');
    }
  });

  // Handle Enter key
  apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveButton.click();
    }
  });
});