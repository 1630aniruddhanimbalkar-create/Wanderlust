const path = require("path");
const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  const alListings = await Listing.find({});
  res.render("listings/index.ejs", { alListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let url = "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60";
  let filename = "listingimage";

  if (req.file) {
    if (req.file.path.includes("uploads")) {
      url = `/uploads/${path.basename(req.file.path)}`;
    } else {
      url = req.file.path;
    }
    filename = req.file.filename;
  }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image ? listing.image.url : "";
  if (originalImageUrl && originalImageUrl.includes("/upload")) {
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  }

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path.includes("uploads")
      ? `/uploads/${path.basename(req.file.path)}`
      : req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
