import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ChatbotService } from '../services/chat-bot.service';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

@Component({
    selector: 'app-chat-bot',
    imports: [FormsModule],
    templateUrl: './chat-bot.component.html',
    styleUrl: './chat-bot.component.css'
})
export class ChatBotComponent {
  messages: Message[] = [];
  userInput: string = ''; 
  isChatVisible: boolean = false;

  constructor(private chatbotService: ChatbotService) {}

  toggleChat() {
    this.isChatVisible = !this.isChatVisible;
  }

  sendMessage() {
    if (this.userInput.trim()) {
      this.messages.push({ text: this.userInput, sender: 'user' });
      this.getBotResponse(this.userInput);
      this.userInput = '';
    }
  }

  getBotResponse(input: string) {
    this.chatbotService.sendMessageToBot(input).subscribe(
      (response) => {
        this.messages.push({ text: response.answer || 'No response', sender: 'bot' });
      },
      (error) => {
        this.messages.push({ text: 'Error contacting bot. Please try again.', sender: 'bot' });
      }
    );
  }
}
