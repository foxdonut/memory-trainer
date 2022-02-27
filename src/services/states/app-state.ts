import { Update } from 'meiosis-setup/mergerino';
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
  }
};

interface AppContext {
  getState: () => IAppModel;
  update: Update<IAppModel>;
}

export const createActions = ({ getState, update }: AppContext): IAppStateActions => ({
  setPage: (page: Dashboards) => update({ app: { page } }),
  update: update,
  changePage: (page, params, query) => {
    dashboardSvc && dashboardSvc.switchTo(page, params, query);
    update({ app: { page } });
  },
  createRoute: (page, params) => dashboardSvc && dashboardSvc.route(page, params),
  saveModel: (dsModel) => {
    localStorage.setItem(dsModelKey, JSON.stringify(dsModel));
    update({ app: { dsModel: () => dsModel } });
  },
  updateScore: (idx: number, isCorrect: boolean) => {
    const state = getState();
    if (isCorrect) {
      const { correctIdxs } = state.app;
      correctIdxs.add(idx);
      update({ app: { correctIdxs } });
    } else {
      const { wrongIdxs } = state.app;
      wrongIdxs.add(idx);
      update({ app: { wrongIdxs } });
    }
  },
  resetScore: () => {
    update({ app: { correctIdxs: () => new Set(), wrongIdxs: () => new Set() } });
  },
  setDirection: (direction: boolean) => {
    update({ app: { reverseDirection: direction } });
  },
});
