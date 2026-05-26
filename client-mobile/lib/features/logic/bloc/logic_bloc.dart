import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/api/api_client.dart';
import '../data/chat_model.dart';
import 'logic_event.dart';
import 'logic_state.dart';

class LogicBloc extends Bloc<LogicEvent, LogicState> {
  final ApiClient apiClient;
  final List<ChatMessage> _messages = [];

  LogicBloc({required this.apiClient}) : super(LogicInitial()) {
    on<MessageSent>(_onMessageSent);
    on<PersonaChanged>(_onPersonaChanged);
    on<FetchSuggestions>(_onFetchSuggestions);
  }

  List<dynamic> _suggestions = [];

  Future<void> _onFetchSuggestions(
    FetchSuggestions event,
    Emitter<LogicState> emit,
  ) async {
    try {
      final response = await apiClient.get('/submit/${event.module}-suggestions');
      _suggestions = response.data;
      emit(LogicChatUpdated(
        messages: List.from(_messages),
        suggestions: List.from(_suggestions),
      ));
    } catch (e) {
      print('Failed to fetch suggestions: $e');
    }
  }

  Future<void> _onMessageSent(
    MessageSent event,
    Emitter<LogicState> emit,
  ) async {
    final userMessage = ChatMessage(
      text: event.text,
      sender: MessageSender.user,
      timestamp: DateTime.now(),
    );
    _messages.add(userMessage);
    
    emit(LogicChatUpdated(
      messages: List.from(_messages),
      suggestions: List.from(_suggestions),
      isTyping: true,
    ));

    try {
      final response = await apiClient.post(
        '/submit${event.endpoint}',
        data: {
          'messages': _messages.map((m) => {
            'sender': m.sender == MessageSender.user ? 'user' : 'ai',
            'text': m.text,
          }).toList(),
        },
      );

      final aiMessage = ChatMessage(
        text: response.data['text'] ?? 'Operational data received.',
        sender: MessageSender.ai,
        timestamp: DateTime.now(),
      );
      _messages.add(aiMessage);

      emit(LogicChatUpdated(
        messages: List.from(_messages),
        suggestions: List.from(_suggestions),
        isTyping: false,
      ));
    } catch (e) {
      emit(LogicFailure(message: e.toString()));
    }
  }

  void _onPersonaChanged(
    PersonaChanged event,
    Emitter<LogicState> emit,
  ) {
    // Handle persona change if needed (e.g., clear history or update UI)
    emit(LogicChatUpdated(
      messages: List.from(_messages),
      currentPersona: event.persona,
    ));
  }
}
