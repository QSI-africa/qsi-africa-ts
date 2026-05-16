import 'package:equatable/equatable.dart';
import '../data/chat_model.dart';

abstract class LogicState extends Equatable {
  const LogicState();

  @override
  List<Object?> get props => [];
}

class LogicInitial extends LogicState {}

class LogicChatUpdated extends LogicState {
  final List<ChatMessage> messages;
  final bool isTyping;
  final String currentPersona;

  const LogicChatUpdated({
    required this.messages,
    this.isTyping = false,
    this.currentPersona = 'infrastructure',
  });

  @override
  List<Object?> get props => [messages, isTyping, currentPersona];
}

class LogicFailure extends LogicState {
  final String message;

  const LogicFailure({required this.message});

  @override
  List<Object?> get props => [message];
}

class LogicLoading extends LogicState {}
