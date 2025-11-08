# Design Document

## Overview

The AI Response Modal feature enhances the user experience by displaying AI responses in a full-screen, cyberpunk-styled modal dialog. This design replaces the small in-panel response display with an immersive, animated interface that includes typewriter effects, loading animations, and enhanced visual styling. The modal integrates with the existing RiftAI chat component while maintaining backward compatibility with chat history and deep analysis features.

## Architecture

### Component Hierarchy

```
RiftAI.tsx (existing)
├── AIResponseModal.tsx (new)
│   ├── Modal Backdrop
│   ├── Modal Container
│   │   ├── Header Section
│   │   │   ├── Title
│   │   │   ├── Status Bar
│   │   │   └── Close Button
│   │   ├── Question Section
│   │   ├── Answer Section
│   │   │   ├── Loading State (conditional)
│   │   │   └── Typewriter Display (conditional)
│   │   └── Footer Section
│   │       ├── Skip Animation Button
│   │       └── Close Button
│   └── Cyberpunk Decorations
│       ├── Corner Decorations
│       ├── Scanline Effects
│       └── Glow Effects
└── AIDeepAnalysis.tsx (existing, unchanged)
```

### User Flow

```
User Action Flow:
┌─────────────────────────────────────────────────────────┐
│ User clicks preset question                             │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ RiftAI sets modal state:                                │
│ - responseModalOpen = true                              │
│ - modalQuestion = question text                         │
│ - modalAnswer = cached answer                           │
│ - isProcessing = false                                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ AIResponseModal renders:                                │
│ - Shows question immediately                            │
│ - Starts typewriter animation for answer                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ User watches animation or clicks SKIP                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ User clicks close → modal closes → chat history updated │
└─────────────────────────────────────────────────────────┘

Custom Question Flow:
┌─────────────────────────────────────────────────────────┐
│ User types custom question and clicks SEND              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ RiftAI sets modal state:                                │
│ - responseModalOpen = true                              │
│ - modalQuestion = user input                            │
│ - modalAnswer = ""                                      │
│ - isProcessing = true                                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ AIResponseModal renders loading state:                  │
│ - Rotating gear animation                               │
│ - Progress bar (0-100% loop)                            │
│ - Status text rotation                                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ RiftAI calls API → receives response                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ RiftAI updates modal state:                             │
│ - modalAnswer = API response                            │
│ - isProcessing = false                                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ AIResponseModal transitions to typewriter animation     │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. AIResponseModal Component (New)

**File:** `src/components/AIResponseModal.tsx`

**Props Interface:**
```typescript
interface AIResponseModalProps {
  isOpen: boolean;          // Controls modal visibility
  onClose: () => void;      // Callback when modal closes
  question: string;         // The user's question text
  answer: string;           // The AI's answer text
  isProcessing?: boolean;   // Whether API call is in progress
}
```

**State Management:**
```typescript
const [displayedAnswer, setDisplayedAnswer] = useState('');
const [isTyping, setIsTyping] = useState(false);
const [loadingProgress, setLoadingProgress] = useState(0);
const [statusTextIndex, setStatusTextIndex] = useState(0);
```

**Key Functions:**

1. **Typewriter Effect:**
```typescript
useEffect(() => {
  if (isOpen && answer && !isProcessing) {
    setIsTyping(true);
    setDisplayedAnswer('');
    
    // Skip animation for very long text
    if (answer.length > 5000) {
      setDisplayedAnswer(answer);
      setIsTyping(false);
      return;
    }
    
    let currentIndex = 0;
    const typingSpeed = 15; // ms per character
    
    const interval = setInterval(() => {
      if (currentIndex < answer.length) {
        setDisplayedAnswer(answer.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, typingSpeed);
    
    return () => clearInterval(interval);
  }
}, [answer, isOpen, isProcessing]);
```

2. **Skip Animation:**
```typescript
const handleSkipAnimation = () => {
  setDisplayedAnswer(answer);
  setIsTyping(false);
};
```

3. **Loading Animation:**
```typescript
useEffect(() => {
  if (isProcessing) {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => (prev + 1) % 101);
    }, 30);
    
    // Status text rotation
    const statusInterval = setInterval(() => {
      setStatusTextIndex(prev => (prev + 1) % statusMessages.length);
    }, 2000);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
    };
  }
}, [isProcessing]);
```

**Visual Structure:**
```tsx
<div className="modal-backdrop">
  <div className="modal-container">
    {/* Corner Decorations */}
    <div className="corner-decoration top-left" />
    <div className="corner-decoration top-right" />
    <div className="corner-decoration bottom-left" />
    <div className="corner-decoration bottom-right" />
    
    {/* Scanline Effect */}
    <div className="scanline" />
    
    {/* Header */}
    <div className="header">
      <h2>🤖 RIFT-CORE AI RESPONSE</h2>
      <div className="status-bar">
        Status: {isProcessing ? 'PROCESSING' : 'COMPLETE'} | 
        Confidence: 96.3% | 
        Time: 1.2s
      </div>
      <button onClick={onClose}>✕</button>
    </div>
    
    {/* Question Section */}
    <div className="question-section">
      <h3>💬 YOUR QUESTION:</h3>
      <p>{question}</p>
    </div>
    
    {/* Answer Section */}
    <div className="answer-section">
      <h3>🧠 AI ANALYSIS:</h3>
      
      {isProcessing ? (
        <LoadingState 
          progress={loadingProgress}
          statusText={statusMessages[statusTextIndex]}
        />
      ) : (
        <div className="answer-text">
          {displayedAnswer}
          {isTyping && <span className="cursor">▋</span>}
        </div>
      )}
      
      {isTyping && (
        <button onClick={handleSkipAnimation}>
          ⏩ SKIP ANIMATION
        </button>
      )}
    </div>
    
    {/* Footer */}
    <div className="footer">
      <span>NEURAL LINK: STABLE | SYSTEM: RiftAI-47</span>
      <button onClick={onClose}>CLOSE</button>
    </div>
  </div>
</div>
```

### 2. RiftAI Component Updates (Existing)

**File:** `src/components/RiftAI.tsx`

**New State Variables:**
```typescript
const [responseModalOpen, setResponseModalOpen] = useState(false);
const [modalQuestion, setModalQuestion] = useState('');
const [modalAnswer, setModalAnswer] = useState('');
const [modalProcessing, setModalProcessing] = useState(false);
```

**Updated handlePresetQuestion:**
```typescript
const handlePresetQuestion = (question: string, answer: string) => {
  // Open modal with preset answer
  setModalQuestion(question);
  setModalAnswer(answer);
  setModalProcessing(false);
  setResponseModalOpen(true);
};
```

**Updated handleSendMessage:**
```typescript
const handleSendMessage = async (message: string) => {
  if (isProcessing || !message || !playerData) return;
  
  // Open modal in loading state
  setModalQuestion(message);
  setModalAnswer('');
  setModalProcessing(true);
  setResponseModalOpen(true);
  
  setCustomQuestion('');
  setIsProcessing(true);
  
  try {
    const aiResponse = await postStatefulChatMessage(
      playerData.PlayerID,
      message,
      chatHistory
    );
    
    // Update modal with response
    setModalAnswer(aiResponse);
    setModalProcessing(false);
    
    // Update chat history
    setChatHistory([
      ...chatHistory,
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse }
    ]);
  } catch (error: any) {
    setModalAnswer(`[AI OFFLINE] ${error.message}`);
    setModalProcessing(false);
  } finally {
    setIsProcessing(false);
  }
};
```

**Modal Close Handler:**
```typescript
const handleModalClose = () => {
  setResponseModalOpen(false);
  // Chat history already updated in handleSendMessage
};
```

**JSX Addition:**
```tsx
<AIResponseModal
  isOpen={responseModalOpen}
  onClose={handleModalClose}
  question={modalQuestion}
  answer={modalAnswer}
  isProcessing={modalProcessing}
/>
```

## Data Models

### Modal State
```typescript
interface ModalState {
  isOpen: boolean;
  question: string;
  answer: string;
  isProcessing: boolean;
}
```

### Loading State Messages
```typescript
const statusMessages = [
  "Analyzing player data...",
  "Cross-referencing statistics...",
  "Consulting neural network...",
  "Generating insights...",
  "Finalizing response..."
];
```

## Error Handling

### API Error Display
```typescript
// In RiftAI.tsx handleSendMessage catch block
catch (error: any) {
  const errorMessage = error.message || 'Unknown error occurred';
  setModalAnswer(`[AI OFFLINE] ${errorMessage}`);
  setModalProcessing(false);
  
  // Add error to chat history
  setChatHistory([
    ...chatHistory,
    { role: 'user', content: message },
    { role: 'error', content: `[AI OFFLINE] ${errorMessage}` }
  ]);
}
```

### Modal Cleanup
```typescript
// Ensure intervals are cleared when modal closes
useEffect(() => {
  if (!isOpen) {
    setDisplayedAnswer('');
    setIsTyping(false);
    setLoadingProgress(0);
    setStatusTextIndex(0);
  }
}, [isOpen]);
```

## Testing Strategy

### Unit Tests
- Test typewriter animation starts and completes correctly
- Test skip animation button immediately shows full text
- Test loading state animations cycle properly
- Test modal open/close state management
- Test long text (>5000 chars) skips typewriter effect

### Integration Tests
- Test preset question flow: click → modal opens → answer displays
- Test custom question flow: input → send → loading → answer
- Test modal close updates chat history correctly
- Test modal doesn't interfere with deep analysis feature
- Test error handling displays error message in modal

### Visual Tests
- Verify cyberpunk styling (colors, borders, shadows)
- Verify corner decorations render correctly
- Verify scanline animation plays smoothly
- Verify typewriter cursor blinks correctly
- Verify loading animations are smooth

### Performance Tests
- Test typewriter animation with 10,000+ character text
- Test rapid open/close cycles don't cause memory leaks
- Test multiple intervals are properly cleaned up
- Test modal rendering doesn't block main thread

## Performance Considerations

### Optimizations
1. **Long Text Handling:** Skip typewriter for answers >5000 characters
2. **Interval Cleanup:** Always clear intervals in useEffect cleanup
3. **Memoization:** Use React.memo for modal if re-renders are frequent
4. **Lazy Loading:** Modal component can be lazy-loaded if needed

### Potential Issues
- **Memory Leaks:** Multiple setInterval calls must be cleaned up
- **Performance:** Very long typewriter animations may feel slow
- **Mobile:** Large modal may need responsive adjustments

## Security Considerations

- **XSS Prevention:** Sanitize answer text if it contains HTML
- **Input Validation:** Validate question length before API call
- **Error Messages:** Don't expose sensitive system information in errors

## Styling Details

### Color Palette
```css
--cyan-primary: #00ffff;
--magenta-accent: #ff00ff;
--dark-bg: #0a0e27;
--text-light: #aaaaaa;
--text-highlight: #00ffff;
--question-bg: rgba(255, 0, 255, 0.05);
--border-glow: 0 0 60px rgba(0, 255, 255, 0.5);
```

### Animations
```css
/* Modal entrance */
@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(50px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Cursor blink */
@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Scanline */
@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}

/* Loading rotation */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Responsive Design
```css
/* Desktop (default) */
.modal-container {
  max-width: 896px; /* 4xl */
  max-height: 85vh;
}

/* Tablet */
@media (max-width: 768px) {
  .modal-container {
    max-width: 90vw;
    max-height: 90vh;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .modal-container {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .typewriter-speed {
    /* Faster on mobile */
    animation-duration: 10ms;
  }
}
```

## Migration Notes

### New Files
- `src/components/AIResponseModal.tsx` (new component)
- `src/components/AIResponseModal.module.css` (optional, if using CSS modules)

### Modified Files
- `src/components/RiftAI.tsx` (add modal integration)

### No Breaking Changes
- Existing chat functionality remains unchanged
- Deep analysis feature remains unchanged
- Chat history management remains unchanged

### Deployment Checklist
1. Create AIResponseModal component
2. Update RiftAI component with modal integration
3. Test preset questions open modal correctly
4. Test custom questions show loading then answer
5. Test modal close updates chat history
6. Test on mobile devices for responsive design
7. Verify no memory leaks from intervals
8. Deploy to production
