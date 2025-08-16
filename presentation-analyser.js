class PresentationAnalyser {
    constructor() {
        this.currentInputType = 'youtube';
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.recordingTimer = null;
        this.recordingStartTime = null;
        this.isRecording = false;
        this.analysisData = null;
        
        this.initializeEventListeners();
        this.initializeInputTypes();
    }

    initializeEventListeners() {
        // Input type buttons
        document.getElementById('youtubeBtn').addEventListener('click', () => this.switchInputType('youtube'));
        document.getElementById('uploadBtn').addEventListener('click', () => this.switchInputType('upload'));
        document.getElementById('liveBtn').addEventListener('click', () => this.switchInputType('live'));

        // File upload
        const fileUpload = document.getElementById('fileUpload');
        const uploadArea = document.getElementById('uploadArea');
        
        uploadArea.addEventListener('click', () => fileUpload.click());
        fileUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('border-indigo-500');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('border-indigo-500');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('border-indigo-500');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processFile(files[0]);
            }
        });

        // Recording controls
        document.getElementById('startRecording').addEventListener('click', () => this.startRecording());
        document.getElementById('stopRecording').addEventListener('click', () => this.stopRecording());
        document.getElementById('enableVideo').addEventListener('change', (e) => this.toggleVideoPreview(e.target.checked));

        // Analysis button
        document.getElementById('analyzeBtn').addEventListener('click', () => this.analyzePresentation());

        // Export buttons
        document.getElementById('exportPDF').addEventListener('click', () => this.exportReport('pdf'));
        document.getElementById('exportJSON').addEventListener('click', () => this.exportReport('json'));
        document.getElementById('shareReport').addEventListener('click', () => this.shareReport());
    }

    initializeInputTypes() {
        this.switchInputType('youtube');
    }

    switchInputType(type) {
        // Update button states
        document.querySelectorAll('.input-type-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-indigo-600', 'text-white', 'border-indigo-600');
            btn.classList.add('bg-lab-dark', 'text-gray-400', 'border-lab-border');
        });
        
        const activeBtn = document.getElementById(`${type}Btn`);
        activeBtn.classList.add('active', 'bg-indigo-600', 'text-white', 'border-indigo-600');
        activeBtn.classList.remove('bg-lab-dark', 'text-gray-400', 'border-lab-border');

        // Show/hide input sections
        document.querySelectorAll('.input-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        document.getElementById(`${type}Input`).classList.remove('hidden');
        this.currentInputType = type;

        // Update analyze button text
        const analyzeBtn = document.getElementById('analyzeBtn');
        switch(type) {
            case 'youtube':
                analyzeBtn.innerHTML = '🔍 Analyze YouTube Video';
                break;
            case 'upload':
                analyzeBtn.innerHTML = '🔍 Analyze Uploaded File';
                break;
            case 'live':
                analyzeBtn.innerHTML = '🔍 Start Live Analysis';
                break;
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        const uploadArea = document.getElementById('uploadArea');
        const uploadProgress = document.getElementById('uploadProgress');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        // Show upload progress
        uploadArea.classList.add('hidden');
        uploadProgress.classList.remove('hidden');

        // Simulate file processing
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                setTimeout(() => {
                    uploadProgress.classList.add('hidden');
                    uploadArea.classList.remove('hidden');
                    uploadArea.innerHTML = `
                        <div class="text-4xl mb-2">✅</div>
                        <p class="text-green-400">File uploaded successfully</p>
                        <p class="text-xs text-gray-500 mt-1">${file.name}</p>
                    `;
                }, 500);
            }
            
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `Uploading... ${Math.round(progress)}%`;
        }, 200);
    }

    async toggleVideoPreview(enabled) {
        const previewVideo = document.getElementById('previewVideo');
        const previewAudio = document.getElementById('previewAudio');
        const recordingPreview = document.getElementById('recordingPreview');
        const eyeContactIndicator = document.getElementById('eyeContactIndicator');

        if (enabled) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: true, 
                    audio: true 
                });
                
                previewVideo.srcObject = stream;
                previewVideo.classList.remove('hidden');
                previewAudio.classList.add('hidden');
                recordingPreview.classList.remove('hidden');
                eyeContactIndicator.classList.remove('hidden');
                
            } catch (error) {
                console.error('Error accessing camera:', error);
                alert('Could not access camera. Please check permissions.');
                document.getElementById('enableVideo').checked = false;
            }
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: false, 
                    audio: true 
                });
                
                previewAudio.srcObject = stream;
                previewVideo.classList.add('hidden');
                previewAudio.classList.remove('hidden');
                recordingPreview.classList.remove('hidden');
                eyeContactIndicator.classList.add('hidden');
                
            } catch (error) {
                console.error('Error accessing microphone:', error);
                alert('Could not access microphone. Please check permissions.');
            }
        }
    }

    async startRecording() {
        const enableVideo = document.getElementById('enableVideo').checked;
        const startBtn = document.getElementById('startRecording');
        const stopBtn = document.getElementById('stopRecording');
        const timerDisplay = document.getElementById('timerDisplay');
        const recordingTimer = document.getElementById('recordingTimer');
        const realtimeOverlay = document.getElementById('realtimeOverlay');
        const enableRealTimeCoaching = document.getElementById('enableRealTimeCoaching').checked;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: enableVideo,
                audio: true
            });

            this.mediaRecorder = new MediaRecorder(stream);
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, {
                    type: enableVideo ? 'video/webm' : 'audio/webm'
                });
                
                // Create download link for recorded file
                const url = URL.createObjectURL(blob);
                console.log('Recording completed:', url);
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            this.recordingStartTime = Date.now();

            // Update UI
            startBtn.classList.add('hidden');
            stopBtn.classList.remove('hidden');
            recordingTimer.classList.remove('hidden');

            // Show real-time coaching if enabled
            if (enableRealTimeCoaching) {
                realtimeOverlay.classList.remove('hidden');
                this.startRealTimeCoaching();
            }

            // Start timer
            this.recordingTimer = setInterval(() => {
                const elapsed = Date.now() - this.recordingStartTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }, 1000);

        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Could not start recording. Please check permissions.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;

            // Stop all tracks
            const stream = this.mediaRecorder.stream;
            stream.getTracks().forEach(track => track.stop());

            // Update UI
            document.getElementById('startRecording').classList.remove('hidden');
            document.getElementById('stopRecording').classList.add('hidden');
            document.getElementById('recordingTimer').classList.add('hidden');
            document.getElementById('realtimeOverlay').classList.add('hidden');

            // Clear timer
            if (this.recordingTimer) {
                clearInterval(this.recordingTimer);
                this.recordingTimer = null;
            }

            this.stopRealTimeCoaching();
        }
    }

    startRealTimeCoaching() {
        // Simulate real-time coaching metrics
        let fillerCount = 0;
        let paceValue = 50; // Normal pace
        
        const updateCoaching = () => {
            if (!this.isRecording) return;

            // Simulate filler word detection
            if (Math.random() < 0.1) { // 10% chance per update
                fillerCount++;
                document.getElementById('fillerCount').textContent = fillerCount;
            }

            // Simulate pace changes
            paceValue += (Math.random() - 0.5) * 10;
            paceValue = Math.max(0, Math.min(100, paceValue));
            
            const paceMeter = document.getElementById('paceMeter');
            const paceValueEl = document.getElementById('paceValue');
            
            paceMeter.style.width = `${paceValue}%`;
            
            if (paceValue < 30) {
                paceMeter.className = 'bg-red-500 h-2 rounded-full transition-all duration-300';
                paceValueEl.textContent = 'Too Slow';
            } else if (paceValue > 70) {
                paceMeter.className = 'bg-red-500 h-2 rounded-full transition-all duration-300';
                paceValueEl.textContent = 'Too Fast';
            } else {
                paceMeter.className = 'bg-green-500 h-2 rounded-full transition-all duration-300';
                paceValueEl.textContent = 'Normal';
            }

            // Simulate eye contact (video only)
            const eyeContactLight = document.getElementById('eyeContactLight');
            if (eyeContactLight && document.getElementById('enableVideo').checked) {
                const goodEyeContact = Math.random() > 0.3;
                eyeContactLight.className = `w-3 h-3 rounded-full ${goodEyeContact ? 'bg-green-500' : 'bg-red-500'}`;
            }

            setTimeout(updateCoaching, 2000); // Update every 2 seconds
        };

        updateCoaching();
    }

    stopRealTimeCoaching() {
        // Reset coaching values
        document.getElementById('fillerCount').textContent = '0';
        document.getElementById('paceValue').textContent = 'Normal';
        document.getElementById('paceMeter').style.width = '50%';
    }

    async analyzePresentation() {
        const contextForm = document.getElementById('contextForm');
        const formData = new FormData(contextForm);
        
        const presentationTitle = formData.get('presentationTitle');
        if (!presentationTitle.trim()) {
            alert('Please enter a presentation title');
            return;
        }

        // Validate input based on type
        let sourceData = null;
        switch (this.currentInputType) {
            case 'youtube':
                const youtubeUrl = document.getElementById('youtubeUrl').value;
                if (!youtubeUrl.trim()) {
                    alert('Please enter a YouTube URL');
                    return;
                }
                sourceData = { type: 'youtube', url: youtubeUrl };
                break;
                
            case 'upload':
                const fileUpload = document.getElementById('fileUpload');
                if (!fileUpload.files[0]) {
                    alert('Please upload a file');
                    return;
                }
                sourceData = { type: 'upload', file: fileUpload.files[0] };
                break;
                
            case 'live':
                if (!this.recordedChunks.length) {
                    alert('Please record a presentation first');
                    return;
                }
                sourceData = { type: 'live', chunks: this.recordedChunks };
                break;
        }

        // Show analysis status
        this.showAnalysisStatus();
        
        // Simulate analysis process
        await this.performAnalysis({
            title: presentationTitle,
            audience: formData.get('audience'),
            goals: formData.get('goals'),
            source: sourceData
        });
    }

    showAnalysisStatus() {
        document.getElementById('emptyState').classList.add('hidden');
        document.getElementById('analysisResults').classList.add('hidden');
        document.getElementById('analysisStatus').classList.remove('hidden');

        const statusTexts = [
            'Processing audio and video data...',
            'Analyzing vocal patterns...',
            'Detecting filler words...',
            'Evaluating non-verbal cues...',
            'Assessing content structure...',
            'Generating insights...',
            'Preparing report...'
        ];

        let currentStep = 0;
        const progressBar = document.getElementById('analysisProgress');
        const statusText = document.getElementById('statusText');

        const updateProgress = () => {
            if (currentStep < statusTexts.length) {
                statusText.textContent = statusTexts[currentStep];
                progressBar.style.width = `${((currentStep + 1) / statusTexts.length) * 100}%`;
                currentStep++;
                setTimeout(updateProgress, 1500);
            } else {
                this.showAnalysisResults();
            }
        };

        updateProgress();
    }

    async performAnalysis(data) {
        // Simulate API call to analysis service
        // In a real implementation, this would send data to a backend service
        
        this.analysisData = {
            overall: {
                score: 78,
                summary: "Your presentation shows strong content knowledge with room for improvement in delivery pace and eye contact. The storytelling structure is well-developed, and your vocal clarity is excellent."
            },
            vocal: {
                pace: { score: 65, wpm: 180, description: "Speaking slightly fast - consider slowing down for better comprehension" },
                clarity: { score: 92, description: "Excellent articulation and pronunciation" },
                fillerWords: [
                    { word: "um", count: 12 },
                    { word: "uh", count: 8 },
                    { word: "like", count: 5 },
                    { word: "you know", count: 3 }
                ],
                variety: { score: 74, description: "Good vocal variety with some monotone sections" }
            },
            nonVerbal: {
                eyeContact: { score: 68, description: "Moderate eye contact - try to look at camera more frequently" },
                bodyLanguage: { score: 82, description: "Confident posture with minimal distracting gestures" }
            },
            content: {
                relevance: { score: 88, description: "Content stays well focused on the stated topic" },
                storytelling: { score: 75, description: "Clear structure with engaging narrative elements" }
            },
            insights: [
                { priority: "high", text: "Slow down your speaking pace by 10-15% for better audience comprehension" },
                { priority: "high", text: "Reduce filler words by practicing with deliberate pauses" },
                { priority: "medium", text: "Increase eye contact with camera to improve audience connection" },
                { priority: "medium", text: "Add more vocal variety in the middle section to maintain engagement" },
                { priority: "low", text: "Consider adding a stronger call-to-action in your conclusion" }
            ],
            drills: [
                {
                    title: "Pace Control Exercise",
                    description: "Practice reading a paragraph at different speeds. Record yourself and aim for 150-160 words per minute.",
                    duration: "5 minutes daily"
                },
                {
                    title: "Filler Word Elimination",
                    description: "Practice speaking for 2 minutes on any topic without using 'um', 'uh', or 'like'. Use deliberate pauses instead.",
                    duration: "10 minutes daily"
                },
                {
                    title: "Eye Contact Training",
                    description: "Practice presenting to a camera, imagining it's a person. Maintain eye contact for 3-5 seconds at a time.",
                    duration: "15 minutes, 3x per week"
                }
            ]
        };
    }

    showAnalysisResults() {
        document.getElementById('analysisStatus').classList.add('hidden');
        document.getElementById('analysisResults').classList.remove('hidden');

        this.populateResults();
    }

    populateResults() {
        const data = this.analysisData;

        // Overall Summary
        document.getElementById('overallSummary').innerHTML = `
            <div class="flex items-center mb-4">
                <div class="text-3xl font-bold text-indigo-400 mr-4">${data.overall.score}/100</div>
                <div class="flex-1">
                    <div class="bg-lab-dark rounded-full h-3">
                        <div class="bg-indigo-500 h-3 rounded-full" style="width: ${data.overall.score}%"></div>
                    </div>
                </div>
            </div>
            <p class="text-gray-300">${data.overall.summary}</p>
        `;

        // Vocal Analysis
        this.updateProgressBar('paceBar', 'paceScore', data.vocal.pace.score, `${data.vocal.pace.wpm} WPM`);
        document.getElementById('paceDescription').textContent = data.vocal.pace.description;

        this.updateProgressBar('clarityBar', 'clarityScore', data.vocal.clarity.score, `${data.vocal.clarity.score}%`);
        document.getElementById('clarityDescription').textContent = data.vocal.clarity.description;

        // Filler Words Chart
        const fillerChart = document.getElementById('fillerWordsChart');
        fillerChart.innerHTML = data.vocal.fillerWords.map(item => `
            <div class="flex items-center justify-between mb-2">
                <span class="text-gray-300">"${item.word}"</span>
                <div class="flex items-center space-x-2">
                    <div class="bg-lab-border rounded-full h-2 w-24">
                        <div class="bg-red-500 h-2 rounded-full" style="width: ${(item.count / 12) * 100}%"></div>
                    </div>
                    <span class="text-sm font-mono w-8">${item.count}</span>
                </div>
            </div>
        `).join('');

        // Non-Verbal Analysis (show if video was analyzed)
        if (this.currentInputType === 'live' && document.getElementById('enableVideo').checked || 
            this.currentInputType === 'upload') {
            document.getElementById('nonVerbalAnalysis').classList.remove('hidden');
            
            this.updateProgressBar('eyeContactBar', 'eyeContactScore', data.nonVerbal.eyeContact.score, `${data.nonVerbal.eyeContact.score}%`);
            document.getElementById('eyeContactDescription').textContent = data.nonVerbal.eyeContact.description;

            this.updateProgressBar('bodyLanguageBar', 'bodyLanguageScore', data.nonVerbal.bodyLanguage.score, `${data.nonVerbal.bodyLanguage.score}%`);
            document.getElementById('bodyLanguageDescription').textContent = data.nonVerbal.bodyLanguage.description;
        }

        // Content Analysis
        this.updateProgressBar('relevanceBar', 'relevanceScore', data.content.relevance.score, `${data.content.relevance.score}%`);
        document.getElementById('relevanceDescription').textContent = data.content.relevance.description;

        this.updateProgressBar('storytellingBar', 'storytellingScore', data.content.storytelling.score, `${data.content.storytelling.score}%`);
        document.getElementById('storytellingDescription').textContent = data.content.storytelling.description;

        // Actionable Insights
        const insightsContainer = document.getElementById('actionableInsights');
        insightsContainer.innerHTML = data.insights.map((insight, index) => `
            <div class="flex items-start space-x-3 p-3 bg-lab-dark rounded-lg">
                <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    insight.priority === 'high' ? 'bg-red-500' : 
                    insight.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }">
                    ${index + 1}
                </div>
                <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="text-xs px-2 py-1 rounded-full ${
                            insight.priority === 'high' ? 'bg-red-500/20 text-red-300' : 
                            insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'
                        }">
                            ${insight.priority.toUpperCase()} PRIORITY
                        </span>
                    </div>
                    <p class="text-gray-300">${insight.text}</p>
                </div>
            </div>
        `).join('');

        // Practice Drills
        const drillsContainer = document.getElementById('practiceDrills');
        drillsContainer.innerHTML = data.drills.map(drill => `
            <div class="p-4 bg-lab-dark rounded-lg">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-medium text-indigo-300">${drill.title}</h4>
                    <span class="text-xs text-gray-500">${drill.duration}</span>
                </div>
                <p class="text-gray-300 text-sm">${drill.description}</p>
            </div>
        `).join('');
    }

    updateProgressBar(barId, scoreId, score, displayText) {
        const bar = document.getElementById(barId);
        const scoreEl = document.getElementById(scoreId);
        
        if (bar && scoreEl) {
            bar.style.width = `${score}%`;
            scoreEl.textContent = displayText;
        }
    }

    exportReport(format) {
        if (!this.analysisData) {
            alert('No analysis data to export');
            return;
        }

        if (format === 'pdf') {
            // In a real implementation, this would generate a PDF
            alert('PDF export functionality would be implemented here');
        } else if (format === 'json') {
            const dataStr = JSON.stringify(this.analysisData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'presentation-analysis.json';
            link.click();
            
            URL.revokeObjectURL(url);
        }
    }

    shareReport() {
        if (!this.analysisData) {
            alert('No analysis data to share');
            return;
        }

        // In a real implementation, this would generate a shareable link
        const shareUrl = `${window.location.origin}/shared-report/${Date.now()}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Presentation Analysis Report',
                text: `Check out my presentation analysis report - Overall Score: ${this.analysisData.overall.score}/100`,
                url: shareUrl
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('Report link copied to clipboard!');
            });
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new PresentationAnalyser();
});
