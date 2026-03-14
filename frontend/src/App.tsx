import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Preview from './pages/Preview';
import Merge from './pages/Merge';
import Compress from './pages/Compress';
import Split from './pages/Split';
import PdfToImage from './pages/PdfToImage';
import ImageToPdf from './pages/ImageToPdf';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/merge" element={<Merge />} />
          <Route path="/compress" element={<Compress />} />
          <Route path="/split" element={<Split />} />
          <Route path="/pdf-to-image" element={<PdfToImage />} />
          <Route path="/image-to-pdf" element={<ImageToPdf />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
