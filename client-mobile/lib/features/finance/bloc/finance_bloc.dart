import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/models/finance_models.dart';
import '../data/repositories/finance_repository.dart';

// Events
abstract class FinanceEvent extends Equatable {
  const FinanceEvent();
  @override
  List<Object?> get props => [];
}

class FetchFinanceData extends FinanceEvent {}

// State
enum FinanceStatus { initial, loading, success, failure }

class FinanceState extends Equatable {
  final FinanceStatus status;
  final Wallet? wallet;
  final List<Transaction> transactions;
  final List<Invoice> invoices;
  final String? errorMessage;

  const FinanceState({
    this.status = FinanceStatus.initial,
    this.wallet,
    this.transactions = const [],
    this.invoices = const [],
    this.errorMessage,
  });

  FinanceState copyWith({
    FinanceStatus? status,
    Wallet? wallet,
    List<Transaction>? transactions,
    List<Invoice>? invoices,
    String? errorMessage,
  }) {
    return FinanceState(
      status: status ?? this.status,
      wallet: wallet ?? this.wallet,
      transactions: transactions ?? this.transactions,
      invoices: invoices ?? this.invoices,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, wallet, transactions, invoices, errorMessage];
}

// Bloc
class FinanceBloc extends Bloc<FinanceEvent, FinanceState> {
  final FinanceRepository _repository;

  FinanceBloc(this._repository) : super(const FinanceState()) {
    on<FetchFinanceData>(_onFetchFinanceData);
  }

  Future<void> _onFetchFinanceData(FetchFinanceData event, Emitter<FinanceState> emit) async {
    emit(state.copyWith(status: FinanceStatus.loading));
    try {
      final wallet = await _repository.getWallet();
      final transactions = await _repository.getTransactions();
      final invoices = await _repository.getInvoices();
      emit(state.copyWith(
        status: FinanceStatus.success,
        wallet: wallet,
        transactions: transactions,
        invoices: invoices,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: FinanceStatus.failure,
        errorMessage: e.toString(),
      ));
    }
  }
}
