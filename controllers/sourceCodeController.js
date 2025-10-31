const SourceCode = require('../models/SourceCode');

// @desc Get all source codes
exports.getAllSourceCodes = async (req, res) => {
  try {
    const codes = await SourceCode.find();
    res.json(codes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single source code by ID
exports.getSourceCodeById = async (req, res) => {
  try {
    const code = await SourceCode.findById(req.params.id);
    if (!code) return res.status(404).json({ message: "Source Code not found" });
    res.json(code);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create new source code (single or multiple)
exports.createSourceCode = async (req, res) => {
  try {
    const data = req.body;

    // Handle multiple uploads (array)
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return res.status(400).json({ message: "No source codes provided" });
      }
      const savedCodes = await SourceCode.insertMany(data);
      return res.status(201).json({
        message: `${savedCodes.length} Source Codes created successfully`,
        data: savedCodes
      });
    }

    // Handle single upload (object)
    const { name, description, srcCode, language, images, price } = data;
    const newCode = new SourceCode({
      name,
      description,
      srcCode,
      language,
      images,
      price
    });

    const savedCode = await newCode.save();
    res.status(201).json({
      message: "Single Source Code created successfully",
      data: savedCode
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Update source code
exports.updateSourceCode = async (req, res) => {
  try {
    const updatedCode = await SourceCode.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCode)
      return res.status(404).json({ message: "Source Code not found" });
    res.json(updatedCode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Delete source code
exports.deleteSourceCode = async (req, res) => {
  try {
    const deletedCode = await SourceCode.findByIdAndDelete(req.params.id);
    if (!deletedCode)
      return res.status(404).json({ message: "Source Code not found" });
    res.json({ message: "Source Code deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
