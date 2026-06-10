import { useSelector, type TypedUseSelectorHook } from 'react-redux';
import { type RootState } from '../../store/rootReducer';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
