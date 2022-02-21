import { MeiosisContext, Update } from 'meiosis-setup/mergerino';
import { IAppModel } from '../meiosis';
import { dashboardSvc } from '..';
import { Dashboards } from '../../models';
import { DataSet, emptyDataSet } from '../../models/data-set';
/** Application state */

const dsModelKey = 'wordModel';

export interface IAppStateModel {
  app: {
    apiService: string;
    page?: Dashboards;
    dsModel: DataSet;
    correctIdxs: Set<number>;
    wrongIdxs: Set<number>;
    /** Ask from A to B or in the other direction */
    reverseDirection: boolean;
  };
}

export interface IAppStateActions {
  setPage: (page: Dashboards) => void;
  update: Update<IAppModel>;
  changePage: (
    page: Dashboards,
    params?: { [key: string]: string | number | undefined },
    query?: { [key: string]: string | number | undefined }
  ) => void;
  createRoute: (
    page: Dashboards,
    params?: { [key: string]: string | number | undefined },
    query?: { [key: string]: string | number | undefined }
  ) => void;
  saveModel: (ds: DataSet) => void;
  updateScore: (idx: number, isCorrect: boolean) => void;
  resetScore: () => void;
  setDirection: (direction: boolean) => void;
}

export interface IAppState {
  initial: IAppStateModel;
  actions: (context: MeiosisContext<IAppModel>) => IAppStateActions;
}

// console.log(`API server: ${process.env.SERVER}`);

const ds = localStorage.getItem(dsModelKey);
const dsModel = ds ? JSON.parse(ds) : emptyDataSet();
// TODO: DURING DEV
// catModel.form = defaultCapabilityModel.form;
// catModel.settings = defaultCapabilityModel.settings;
// catModel.data = defaultCapabilityModel.data;

export const appStateMgmt = {
  initial: {
    app: {
      /** During development, use this URL to access the server. */
      apiService: process.env.SERVER || window.location.origin,
      dsModel,
      correctIdxs: new Set(),
      wrongIdxs: new Set(),
      reverseDirection: false,
    },
  },
  actions: context => {
    return {
      setPage: (page: Dashboards) => context.update({ app: { page } }),
      update: context.update,
      changePage: (page, params, query) => {
        dashboardSvc && dashboardSvc.switchTo(page, params, query);
        context.update({ app: { page } });
      },
      createRoute: (page, params) => dashboardSvc && dashboardSvc.route(page, params),
      saveModel: (dsModel) => {
        localStorage.setItem(dsModelKey, JSON.stringify(dsModel));
        context.update({ app: { dsModel: () => dsModel } });
      },
      updateScore: (idx: number, isCorrect: boolean) => {
        const state = context.getState();
        if (isCorrect) {
          const { correctIdxs } = state.app;
          correctIdxs.add(idx);
          context.update({ app: { correctIdxs } });
        } else {
          const { wrongIdxs } = state.app;
          wrongIdxs.add(idx);
          context.update({ app: { wrongIdxs } });
        }
      },
      resetScore: () => {
        context.update({ app: { correctIdxs: () => new Set(), wrongIdxs: () => new Set() } });
      },
      setDirection: (direction: boolean) => {
        context.update({ app: { reverseDirection: direction } });
      },
    };
  },
} as IAppState;
