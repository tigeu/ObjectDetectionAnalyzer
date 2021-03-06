import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PredictionComponent} from './prediction.component';
import {HttpClientModule} from "@angular/common/http";
import {of, throwError} from "rxjs";
import {SelectedDatasetChangedService} from "../shared-services/selected-dataset-changed.service";
import {SelectedImageChangedService} from "../shared-services/selected-image-changed-service";
import {Prediction} from "./prediction";
import {PredictionService} from "./prediction.service";
import {PredictionChangedService} from "../shared-services/prediction-changed.service";
import {SelectedPredictionChangedService} from "../shared-services/selected-prediction-changed.service";
import {CocoMetricFile} from "./coco-metric-file";
import {PascalMetricFile} from "./pascal-metric-file";

describe('PredictionsComponent', () => {
  let component: PredictionComponent;
  let fixture: ComponentFixture<PredictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
      ],
      declarations: [PredictionComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PredictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#getPrediction trigger setClassColors and should publish image', () => {
    const prediction: Prediction = {file: new File([""], "test_image.jpg")};
    const predictionService = TestBed.inject(PredictionService);
    const predictionChangedService = TestBed.inject(PredictionChangedService);
    spyOn(predictionService, 'getPrediction').and.returnValue(of(prediction));
    const colorSpy = spyOn(component, "setClassColors");
    const spy = spyOn(predictionChangedService, 'publish');

    component.selectedDataset = {name: "test_dataset"};
    component.selectedImage = "test_image.jpg";

    component.getPrediction();

    expect(colorSpy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(prediction)
  });

  it('dataset subscription should set selectedDataset and reset images and show selection', () => {
    const selectedDatasetChangedService = TestBed.inject(SelectedDatasetChangedService);
    const dataset = {name: "test_dataset"};

    selectedDatasetChangedService.publish(dataset)

    expect(component.selectedDataset).toEqual(dataset);
    expect(component.selectedPrediction).toEqual({name: ""});
    expect(component.selectedImage).toEqual("");
    expect(component.predictionSettings.showPrediction).toEqual(false);
  });

  it('prediction subscription should set selectedPrediction, init classes and colors and trigger #selectionChanged', () => {
    const selectedPredictionChangedService = TestBed.inject(SelectedPredictionChangedService);
    const spy = spyOn(component, 'selectionChanged');
    const pred = {name: "test_pred", classes: ["class1", "class2"], colors: ["color1", "color2"]};

    selectedPredictionChangedService.publish(pred);

    expect(component.selectedPrediction).toEqual(pred);
    expect(spy).toHaveBeenCalled();
    expect(component.showClasses).toEqual([true, true]);
    expect(component.classColors).toEqual(["color1", "color2"]);
  });

  it('prediction subscription should set selectedPrediction without init of classes and colors and trigger #selectionChanged', () => {
    const selectedPredictionChangedService = TestBed.inject(SelectedPredictionChangedService);
    const spy = spyOn(component, 'selectionChanged');
    const pred = {name: "test_pred"};

    selectedPredictionChangedService.publish(pred);

    expect(component.selectedPrediction).toEqual(pred);
    expect(spy).toHaveBeenCalled();
    expect(component.showClasses).toEqual([]);
    expect(component.classColors).toEqual([]);
  });

  it('image subscription should set selectedImage and trigger selectionChanged', () => {
    const selectedImageChangedService = TestBed.inject(SelectedImageChangedService);
    const spy = spyOn(component, 'selectionChanged');

    selectedImageChangedService.publish("test_image.jpg")

    expect(component.selectedImage).toEqual("test_image.jpg");
    expect(spy).toHaveBeenCalled();
  });

  it('#selectionChanged should publish empty string if show gt not checked anymore', () => {
    const predictionChangedService = TestBed.inject(PredictionChangedService);
    const spy = spyOn(predictionChangedService, 'publish');

    component.selectionChanged();

    expect(spy).toHaveBeenCalledWith("");
  });

  it('#selectionChanged should trigger #getGroundTruth if dataset, pred and image are selected', () => {
    const spy = spyOn(component, 'getPrediction');
    component.predictionSettings.showPrediction = true;
    component.selectedDataset = {name: "test_dataset"}
    component.selectedPrediction = {name: "test_pred"};
    component.selectedImage = "test_image.jpg";

    component.selectionChanged();

    expect(spy).toHaveBeenCalled();
  });

  it('#selectionChanged should not trigger #getPrediction if dataset, pred and image are not selected', () => {
    const spy = spyOn(component, 'getPrediction');
    component.selectedDataset = {name: ""};
    component.selectedPrediction = {name: ""};
    component.selectedImage = "";

    component.selectionChanged();

    expect(spy).not.toHaveBeenCalled();
  });

  it('#selectionChanged should call validateNumbers', () => {
    const spy = spyOn(component, 'validateNumbers');
    spyOn(component, 'getPrediction');
    component.selectedDataset = {name: ""};
    component.selectedPrediction = {name: ""};
    component.selectedImage = "";

    component.selectionChanged();

    expect(spy).toHaveBeenCalled();
  });

  it('#setClassColors should set classes in predictionsettings', () => {
    component.showClasses = [true, true]
    component.classColors = ["color1", "newColor"]
    component.selectedPrediction = {
      name: "test_prediction",
      classes: ["class1", "class2"],
      colors: ["color1", "color2"]
    };

    component.setClassColors();

    expect(component.predictionSettings.classes).toEqual(["class1", "class2"]);
    expect(component.predictionSettings.colors).toEqual(["color1", "newColor"]);
  });

  it('#setClassColors should not set classes in predictionsettings if all classes are false', () => {
    component.showClasses = [false, false]
    component.classColors = ["color1", "newColor"]
    component.selectedDataset = {name: "test_dataset", classes: ["class1", "class2"], colors: ["color1", "color2"]};

    component.setClassColors();

    expect(component.predictionSettings.classes).toEqual([]);
    expect(component.predictionSettings.colors).toEqual([]);
  });

  it('#ngOnDestroy unsubscribes from all subscriptions', () => {
    const selectedImageChangedSpy = spyOn(component.selectedImageChanged, 'unsubscribe');
    const selectedDatasetChangedSpy = spyOn(component.selectedDatasetChanged, 'unsubscribe');
    const selectedPredictionChangesSpy = spyOn(component.selectedPredictionChanged, 'unsubscribe');

    component.ngOnDestroy();

    expect(selectedImageChangedSpy).toHaveBeenCalled();
    expect(selectedDatasetChangedSpy).toHaveBeenCalled();
    expect(selectedPredictionChangesSpy).toHaveBeenCalled();
  });

  it('#validateNumbers should call validation methods for confidence, iou, score and gtIoU', () => {
    const confSpy = spyOn(component, "validateConfidence");
    const iouSpy = spyOn(component, "validateIoU");
    const scoreSpy = spyOn(component, "validateScore");
    const gtIouSpy = spyOn(component, "validateGroundTruthIoU");

    component.validateNumbers();

    expect(confSpy).toHaveBeenCalled();
    expect(iouSpy).toHaveBeenCalled();
    expect(scoreSpy).toHaveBeenCalled();
    expect(gtIouSpy).toHaveBeenCalled();
  });

  it('#validateConfidence should min to 0 if null and max to 100 if null', () => {
    component.predictionSettings.minConf = undefined!;
    component.predictionSettings.maxConf = undefined!;

    component.validateConfidence();

    expect(component.predictionSettings.minConf).toBe(0);
    expect(component.predictionSettings.maxConf).toBe(100);
  });

  it('#validateConfidence should set too low numbers to 0 and too high numbers to 100', () => {
    component.predictionSettings.minConf = -1;
    component.predictionSettings.maxConf = 101;

    component.validateConfidence();

    expect(component.predictionSettings.minConf).toBe(0);
    expect(component.predictionSettings.maxConf).toBe(100);
  });

  it('#validateConfidence should set min to max if min is higher than max', () => {
    component.predictionSettings.minConf = 55;
    component.predictionSettings.maxConf = 50;

    component.validateConfidence();

    expect(component.predictionSettings.minConf).toBe(50);
    expect(component.predictionSettings.maxConf).toBe(50);
  });

  it('#validateIoU should set to 0 if null', () => {
    component.predictionSettings.nmsIoU = undefined!;

    component.validateIoU();

    expect(component.predictionSettings.nmsIoU).toBe(0);
  });

  it('#validateIoU should set too low numbers to 0', () => {
    component.predictionSettings.nmsIoU = -1;

    component.validateIoU();

    expect(component.predictionSettings.nmsIoU).toBe(0);
  });

  it('#validateIoU should set too high numbers to 1', () => {
    component.predictionSettings.nmsIoU = 2;

    component.validateIoU();

    expect(component.predictionSettings.nmsIoU).toBe(1);
  });

  it('#validateScore should set to 0 if null', () => {
    component.predictionSettings.nmsScore = undefined!;

    component.validateScore();

    expect(component.predictionSettings.nmsScore).toBe(0);
  });

  it('#validateScore should set too low numbers to 0', () => {
    component.predictionSettings.nmsScore = -1;

    component.validateScore();

    expect(component.predictionSettings.nmsScore).toBe(0);
  });

  it('#validateScore should set too high numbers to 1', () => {
    component.predictionSettings.nmsScore = 2;

    component.validateScore();

    expect(component.predictionSettings.nmsScore).toBe(1);
  });

  it('#validateGroundTruthIoU should set to 0 if null', () => {
    component.predictionSettings.groundTruthIoU = undefined!;

    component.validateGroundTruthIoU();

    expect(component.predictionSettings.groundTruthIoU).toBe(0);
  });

  it('#validategroundTruthIoU should set too low numbers to 0', () => {
    component.predictionSettings.groundTruthIoU = -1;

    component.validateGroundTruthIoU();

    expect(component.predictionSettings.groundTruthIoU).toBe(0);
  });

  it('#validategroundTruthIoU should set too high numbers to 1', () => {
    component.predictionSettings.groundTruthIoU = 2;

    component.validateGroundTruthIoU();

    expect(component.predictionSettings.groundTruthIoU).toBe(1);
  });

  it('#calculateMetric should set metric header and call coco metric', () => {
    const headerSpy = spyOn(component, "setMetricHeader");
    const cocoMetricSpy = spyOn(component, "calculateCocoMetric");
    component.predictionSettings.metric = "coco";

    component.calculateMetric(true);

    expect(component.showErrorMessage).not.toBeTruthy();
    expect(headerSpy).toHaveBeenCalledWith(true);
    expect(cocoMetricSpy).toHaveBeenCalledWith(true);
  });

  it('#calculateMetric should set metric header and call pascal metric', () => {
    const headerSpy = spyOn(component, "setMetricHeader");
    const pascalMetricSpy = spyOn(component, "calculatePascalMetric");
    component.predictionSettings.metric = "pascal";

    component.calculateMetric(true);

    expect(headerSpy).toHaveBeenCalledWith(true);
    expect(pascalMetricSpy).toHaveBeenCalledWith(true);
  });

  it('#setMetricHeader should set header to datasetname', () => {
    component.selectedDataset.name = "test_dataset";

    component.setMetricHeader(true);

    expect(component.metricHeader).toEqual("Results for test_dataset");
  });

  it('#setMetricHeader should set header to image name', () => {
    component.selectedImage = "test_image"

    component.setMetricHeader(false);

    expect(component.metricHeader).toEqual("Results for test_image");
  });

  it('#calculatePascalMetric should reset metric and call service', () => {
    const predictionService = TestBed.inject(PredictionService);
    const resetMetricSpy = spyOn(component, "resetMetric");
    const metricFile: PascalMetricFile = {mAP: 0.5}
    const spy = spyOn(predictionService, "getPascalMetric").and.returnValue(of(metricFile));

    component.calculatePascalMetric(true);

    expect(resetMetricSpy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
    expect(component.pascalMetric).toEqual(metricFile);
    expect(component.calculatingMetric).not.toBeTruthy();
  });

  it('#calculatePascalMetric should reset metric and call service with error', () => {
    const predictionService = TestBed.inject(PredictionService);
    const resetMetricSpy = spyOn(component, "resetMetric");
    const spy = spyOn(predictionService, "getPascalMetric").and.returnValue(throwError(() => "error"));

    component.calculatePascalMetric(true);

    expect(resetMetricSpy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
    expect(component.pascalMetric).toEqual(undefined);
    expect(component.calculatingMetric).not.toBeTruthy();
    expect(component.showErrorMessage).toBeTruthy();
  });

  it('#calculateCocoMetric should reset metric and call service', () => {
    const predictionService = TestBed.inject(PredictionService);
    const resetMetricSpy = spyOn(component, "resetMetric");
    const metricFile: CocoMetricFile = {}
    const spy = spyOn(predictionService, "getCocoMetric").and.returnValue(of(metricFile));

    component.calculateCocoMetric(true);

    expect(resetMetricSpy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
    expect(component.cocoMetric).toEqual(metricFile);
    expect(component.calculatingMetric).not.toBeTruthy();
  });

  it('#calculateCocoMetric should reset metric and call service with error', () => {
    const predictionService = TestBed.inject(PredictionService);
    const resetMetricSpy = spyOn(component, "resetMetric");
    const spy = spyOn(predictionService, "getCocoMetric").and.returnValue(throwError(() => "error"));

    component.calculateCocoMetric(true);

    expect(resetMetricSpy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
    expect(component.cocoMetric).toEqual(undefined);
    expect(component.calculatingMetric).not.toBeTruthy();
    expect(component.showErrorMessage).toBeTruthy();
  });

  it('#resetMetric should set both metric variables to undefined', () => {
    component.resetMetric();

    expect(component.pascalMetric).toBe(undefined);
    expect(component.cocoMetric).toBe(undefined);
  });
});
