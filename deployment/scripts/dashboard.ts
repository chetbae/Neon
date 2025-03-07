import { InitDocumentSelector } from '../../src/Dashboard/DocumentSelector';
import { InitUploadArea } from '../../src/Dashboard/uploadArea';
import FileManager from '../../src/Dashboard/FileManager';

export const fm = FileManager.getInstance();
export const selectedDocs = [];

InitDocumentSelector();

document.querySelector('#upload-new-doc-button')?.addEventListener('click', function() {
  InitUploadArea();
});

document.querySelector('#home-link')?.setAttribute('href', __LINK_LOCATION__);

