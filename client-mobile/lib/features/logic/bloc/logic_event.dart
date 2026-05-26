import 'package:equatable/equatable.dart';

abstract class LogicEvent extends Equatable {
  const LogicEvent();

  @override
  List<Object?> get props => [];
}

class MessageSent extends LogicEvent {
  final String text;
  final String endpoint;

  const MessageSent({required this.text, required this.endpoint});

  @override
  List<Object?> get props => [text, endpoint];
}

class PersonaChanged extends LogicEvent {
  final String persona;

  const PersonaChanged({required this.persona});

  @override
  List<Object?> get props => [persona];
}

class FetchSuggestions extends LogicEvent {
  final String module;

  const FetchSuggestions({required this.module});

  @override
  List<Object?> get props => [module];
}
