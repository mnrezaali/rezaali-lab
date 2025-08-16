class PromptGenerator {
    constructor() {
        this.currentPrompt = '';
        this.chatHistory = [];
        this.promptHistory = this.loadHistory();
        this.isGenerating = false;
        
        this.initializeEventListeners();
        this.renderHistory();
    }

    initializeEventListeners() {
        // Form submission
        document.getElementById('promptForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generatePrompt();
        });

        // Template clicks
        document.querySelectorAll('.prompt-template').forEach(template => {
            template.addEventListener('click', () => {
                this.loadTemplate(template);
            });
        });

        // Chat form
        document.getElementById('chatForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendChatMessage();
        });

        // History controls
        document.getElementById('toggleHistory').addEventListener('click', () => {
            this.toggleHistory();
        });

        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearHistory();
        });

        // Copy button
        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copyPrompt();
        });
    }

    loadTemplate(template) {
        const purpose = template.dataset.purpose;
        const tone = template.dataset.tone;
        const audience = template.dataset.audience;

        document.getElementById('purpose').value = purpose;
        document.getElementById('tone').value = tone;
        document.getElementById('audience').value = audience;

        // Auto-generate
        this.generatePrompt();
    }

    async generatePrompt() {
        if (this.isGenerating) return;

        const form = document.getElementById('promptForm');
        const formData = new FormData(form);
        const purpose = formData.get('purpose');
        const tone = formData.get('tone');
        const audience = formData.get('audience');

        if (!purpose.trim()) {
            this.showError('Please provide a purpose for your AI assistant.');
            return;
        }

        this.isGenerating = true;
        this.showLoading();
        this.resetChat();

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'generate',
                    purpose,
                    tone,
                    audience: audience || undefined
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let prompt = '';

            this.showPromptContent();
            const contentEl = document.getElementById('promptContent');
            contentEl.innerHTML = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                prompt += chunk;
                
                // Format and display the prompt with streaming effect
                contentEl.innerHTML = this.formatPrompt(prompt);
                contentEl.scrollTop = contentEl.scrollHeight;
            }

            this.currentPrompt = prompt;
            this.saveToHistory(purpose, prompt);
            this.showChatPanel();
            document.getElementById('copyBtn').classList.remove('hidden');

        } catch (error) {
            console.error('Generation error:', error);
            this.showError('Failed to generate prompt. Please check your connection and try again.');
        } finally {
            this.isGenerating = false;
        }
    }

    async sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message || this.isGenerating) return;

        this.isGenerating = true;
        input.value = '';
        
        // Add user message to chat
        this.addChatMessage(message, 'user');
        this.showChatLoading();

        // Prepare chat history for API
        const chatHistory = [
            { role: 'user', content: `Current prompt: ${this.currentPrompt}` },
            ...this.chatHistory,
            { role: 'user', content: message }
        ];

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'refine',
                    chatHistory
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let newPrompt = '';

            this.hideChatLoading();
            const contentEl = document.getElementById('promptContent');
            contentEl.innerHTML = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                newPrompt += chunk;
                
                contentEl.innerHTML = this.formatPrompt(newPrompt);
                contentEl.scrollTop = contentEl.scrollHeight;
            }

            this.currentPrompt = newPrompt;
            this.chatHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: 'Updated prompt as requested.' }
            );

            this.addChatMessage('Updated prompt as requested.', 'assistant');

        } catch (error) {
            console.error('Refinement error:', error);
            this.addChatMessage('Sorry, I couldn\'t process your request. Please try again.', 'assistant');
        } finally {
            this.isGenerating = false;
            this.hideChatLoading();
        }
    }

    formatPrompt(text) {
        // Convert markdown-style formatting to HTML
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300 text-lg block mt-4 mb-2">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p class="mb-3">')
            .replace(/\n- /g, '</p><li class="ml-4 mb-1">• ')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p class="mb-3">')
            .replace(/$/, '</p>');
    }

    addChatMessage(message, role) {
        const messagesEl = document.getElementById('chatMessages');
        const messageEl = document.createElement('div');
        messageEl.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
        
        messageEl.innerHTML = `
            <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                role === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-700 text-gray-200'
            }">
                ${message}
            </div>
        `;
        
        messagesEl.appendChild(messageEl);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    showLoading() {
        document.getElementById('emptyState').classList.add('hidden');
        document.getElementById('errorState').classList.add('hidden');
        document.getElementById('promptContent').classList.add('hidden');
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('copyBtn').classList.add('hidden');
    }

    showPromptContent() {
        document.getElementById('emptyState').classList.add('hidden');
        document.getElementById('errorState').classList.add('hidden');
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('promptContent').classList.remove('hidden');
    }

    showError(message) {
        document.getElementById('emptyState').classList.add('hidden');
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('promptContent').classList.add('hidden');
        document.getElementById('errorState').classList.remove('hidden');
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('copyBtn').classList.add('hidden');
    }

    showChatPanel() {
        document.getElementById('chatPanel').classList.remove('hidden');
    }

    showChatLoading() {
        document.getElementById('chatLoading').classList.remove('hidden');
    }

    hideChatLoading() {
        document.getElementById('chatLoading').classList.add('hidden');
    }

    resetChat() {
        this.chatHistory = [];
        document.getElementById('chatMessages').innerHTML = '';
        document.getElementById('chatPanel').classList.add('hidden');
    }

    copyPrompt() {
        if (!this.currentPrompt) return;
        
        navigator.clipboard.writeText(this.currentPrompt).then(() => {
            const btn = document.getElementById('copyBtn');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.classList.add('bg-green-600');
            btn.classList.remove('bg-indigo-600');
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('bg-green-600');
                btn.classList.add('bg-indigo-600');
            }, 2000);
        });
    }

    saveToHistory(purpose, prompt) {
        const historyItem = {
            id: Date.now(),
            purpose: purpose.substring(0, 100) + (purpose.length > 100 ? '...' : ''),
            prompt,
            timestamp: new Date().toISOString()
        };

        this.promptHistory.unshift(historyItem);
        this.promptHistory = this.promptHistory.slice(0, 10); // Keep only last 10
        
        localStorage.setItem('promptHistory', JSON.stringify(this.promptHistory));
        this.renderHistory();
    }

    loadHistory() {
        try {
            return JSON.parse(localStorage.getItem('promptHistory') || '[]');
        } catch {
            return [];
        }
    }

    renderHistory() {
        const historyEl = document.getElementById('historyContent');
        
        if (this.promptHistory.length === 0) {
            historyEl.innerHTML = '<p class="text-gray-500 text-sm">No prompts generated yet</p>';
            return;
        }

        historyEl.innerHTML = this.promptHistory.map(item => `
            <div class="history-item p-3 bg-lab-dark border border-lab-border rounded-lg cursor-pointer hover:border-indigo-500 transition-colors" 
                 data-prompt="${encodeURIComponent(item.prompt)}">
                <div class="font-medium text-sm text-indigo-300 truncate">${item.purpose}</div>
                <div class="text-xs text-gray-500 mt-1">${new Date(item.timestamp).toLocaleDateString()}</div>
            </div>
        `).join('');

        // Add click listeners to history items
        historyEl.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const prompt = decodeURIComponent(item.dataset.prompt);
                this.loadFromHistory(prompt);
            });
        });
    }

    loadFromHistory(prompt) {
        this.currentPrompt = prompt;
        this.showPromptContent();
        document.getElementById('promptContent').innerHTML = this.formatPrompt(prompt);
        document.getElementById('copyBtn').classList.remove('hidden');
        this.resetChat();
        this.showChatPanel();
    }

    toggleHistory() {
        const historyEl = document.getElementById('historyContent');
        const toggleBtn = document.getElementById('toggleHistory');
        
        if (historyEl.classList.contains('hidden')) {
            historyEl.classList.remove('hidden');
            toggleBtn.textContent = 'Hide History';
        } else {
            historyEl.classList.add('hidden');
            toggleBtn.textContent = 'Show History';
        }
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all prompt history?')) {
            this.promptHistory = [];
            localStorage.removeItem('promptHistory');
            this.renderHistory();
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new PromptGenerator();
});
