import React, { useState, useEffect, useRef } from 'react';
import { IconButton, CircularProgress, Tooltip, Snackbar, Alert } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import axios from 'axios';
import { CHAT_QNA_URL } from '@/lib/constants';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscription, disabled = false }) => {
  const [recording, setRecording] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const showFeedback = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setShowToast(true);
  };
  
  const startRecording = async () => {
    try {
      setError(null);
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = handleAudioStop;
      
      mediaRecorder.start();
      setRecording(true);
      showFeedback('Recording started...', 'info');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      const errorMessage = 'Could not access microphone. Please check permissions.';
      setError(errorMessage);
      showFeedback(errorMessage, 'error');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      showFeedback('Processing audio...', 'info');
    }
  };
  
  const handleAudioStop = async () => {
    setRecording(false);
    
    if (audioChunksRef.current.length === 0) {
      showFeedback('No audio recorded. Try again.', 'warning');
      return;
    }
    
    try {
      setProcessing(true);
      
      // Create a blob from the audio chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Check if the audio duration is too short
      if (audioChunksRef.current.length === 1 && audioChunksRef.current[0].size < 1000) {
        showFeedback('Recording too short. Please try again.', 'warning');
        setProcessing(false);
        return;
      }
      
      // Create form data for API request
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      
      try {
        const healthResponse = await axios.get(`${CHAT_QNA_URL}/api/whisper_healthcheck`);
        if (healthResponse.data.status === 'unhealthy' && 
            healthResponse.data.issues.includes('ffmpeg is not installed')) {
          throw new Error('ffmpeg_missing');
        }
      } catch (healthErr: any) {
        // If health check fails for any reason, just continue with transcription
        console.log('Whisper service health check failed, continuing with transcription');
      }
      
      // Send to Whisper API
      const response = await axios.post(`${CHAT_QNA_URL}/api/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });
      
      if (response.data && response.data.text && response.data.text.trim()) {
        onTranscription(response.data.text);
        showFeedback('Transcription successful!', 'success');
      } else {
        // Show alert for empty speech instead of passing to input
        showFeedback('No speech detected. Please try again.', 'warning');
      }
    } catch (err: any) {
      console.error('Error processing audio:', err);
      
      if (err.message === 'ffmpeg_missing') {
        const errorMsg = 'Server configuration error: ffmpeg is not installed on the server. Please contact support.';
        setError(errorMsg);
        showFeedback(errorMsg, 'error');
      } else if (err.response?.data?.detail && err.response.data.detail.includes('ffmpeg')) {
        const errorMsg = 'Server configuration error: ffmpeg is not installed. Please contact support.';
        setError(errorMsg);
        showFeedback(errorMsg, 'error');
      } else {
        const errorMsg = err.response?.data?.detail || 
                        'Failed to transcribe audio. Please try again.';
        setError(errorMsg);
        showFeedback(errorMsg, 'error');
      }
    } finally {
      setProcessing(false);
    }
  };
  
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && recording) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [recording]);
  
  let buttonColor = 'default';
  if (recording) buttonColor = 'error';
  else if (error) buttonColor = 'warning';
  
  return (
    <>
      <Tooltip title={error || (recording ? 'Stop recording' : 'Start voice input')}>
        <IconButton
          onClick={recording ? stopRecording : startRecording}
          color={buttonColor as 'default' | 'error' | 'warning'}
          disabled={processing || disabled}
          sx={{
            transition: 'all 0.2s',
          }}
        >
          {processing ? (
            <CircularProgress size={24} />
          ) : recording ? (
            <StopIcon />
          ) : (
            <MicIcon />
          )}
        </IconButton>
      </Tooltip>
      
      <Snackbar 
        open={showToast}
        autoHideDuration={4000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowToast(false)} 
          severity={toastSeverity}
          sx={{ width: '100%' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AudioRecorder; 