import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';


interface Message {
  text: string;
  sender: 'user' | 'bot';
}

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './chat-bot.component.html',
  styleUrl: './chat-bot.component.css'
})
export class ChatBotComponent {
  messages: Message[] = [];
  userInput: string = '';
  isChatVisible: boolean = false; // Initially set to false
  toggleChat() {
    this.isChatVisible = !this.isChatVisible; // Toggle chat visibility
  }
  sendMessage() {
    if (this.userInput.trim()) {
      this.messages.push({ text: this.userInput, sender: 'user' });
      this.getBotResponse(this.userInput);
      this.userInput = '';
    }
  }

  getBotResponse(input: string) {
    setTimeout(() => {
      this.messages.push({ text: `You said: ${input}`, sender: 'bot' });
    }, 1000);
  }
}
