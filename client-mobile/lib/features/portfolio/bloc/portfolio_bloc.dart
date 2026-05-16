import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/repositories/portfolio_repository.dart';
import '../data/models/portfolio_item.dart';
import 'portfolio_event.dart';
import 'portfolio_state.dart';

class PortfolioBloc extends Bloc<PortfolioEvent, PortfolioState> {
  final PortfolioRepository _repository;

  PortfolioBloc(this._repository) : super(const PortfolioState()) {
    on<FetchPortfolio>(_onFetchPortfolio);
    on<ChangePortfolioCategory>(_onChangePortfolioCategory);
    on<FetchItemDetail>(_onFetchItemDetail);
    on<SubmitEngagement>(_onSubmitEngagement);
  }

  Future<void> _onFetchPortfolio(FetchPortfolio event, Emitter<PortfolioState> emit) async {
    emit(state.copyWith(status: PortfolioStatus.loading, category: event.category));
    try {
      final concepts = await _repository.getConcepts(category: event.category);
      final demos = await _repository.getDemos(category: event.category);
      emit(state.copyWith(
        status: PortfolioStatus.success,
        concepts: concepts,
        demos: demos,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: PortfolioStatus.failure,
        errorMessage: e.toString(),
      ));
    }
  }

  Future<void> _onChangePortfolioCategory(ChangePortfolioCategory event, Emitter<PortfolioState> emit) async {
    add(FetchPortfolio(category: event.category));
  }

  Future<void> _onFetchItemDetail(FetchItemDetail event, Emitter<PortfolioState> emit) async {
    emit(state.copyWith(status: PortfolioStatus.loading));
    try {
      final item = event.type == PortfolioType.concept
          ? await _repository.getConceptDetail(event.id)
          : await _repository.getDemoDetail(event.id);
      emit(state.copyWith(
        status: PortfolioStatus.success,
        selectedItem: item,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: PortfolioStatus.failure,
        errorMessage: e.toString(),
      ));
    }
  }

  Future<void> _onSubmitEngagement(SubmitEngagement event, Emitter<PortfolioState> emit) async {
    emit(state.copyWith(status: PortfolioStatus.loading));
    try {
      await _repository.submitEngagement(event.data);
      emit(state.copyWith(status: PortfolioStatus.success));
    } catch (e) {
      emit(state.copyWith(status: PortfolioStatus.failure, errorMessage: e.toString()));
    }
  }
}
