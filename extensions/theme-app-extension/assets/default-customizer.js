(function () {
  // Load the script
  var jqueryScript = document.getElementById("link-jquery-js");
  var script = document.createElement("SCRIPT");
  script.src = jqueryScript.getAttribute("data-asset-jquery");
  script.type = "text/javascript";
  document.getElementsByTagName("head")[0].prepend(script);
  // Poll for jQuery to come into existance
  var checkReady = function (callback) {
    $(
      `.single-option-radio input[data-id='${window.location.search
        .split("=")
        .pop()}']`
    ).prop("checked", true);
    if (window.jQuery) {
      callback(jQuery);
    } else {
      window.setTimeout(function () {
        checkReady(callback);
      }, 20);
    }
  };

  let message = "";
  checkReady(function ($) {
    $(function () {
      setTimeout(() => {
        $(document).ready(function () {
          var baseAPIURl = "https://preorder.tumbleliving.com"; // Enter your API URL here
          let shopName = "loohm.myshopify.com"; // Enter your shop name here
          async function shipmentMessageFun(varId, quant) {
            var stockResult = jQuery.ajax({
              type: "POST",
              dataType: "json",
              url:
                baseAPIURl +
                `/shopify_product/shipmentMessage?shop=${shopName}`,
              data: {
                variant_id: varId,
                quantity: parseInt(quant),
              },
            });
            return stockResult;
          }
          async function apiResp() {          
            // showLoader();
            $('.free-ship-msg .in-stock').html(function(index, oldHtml) {
              return oldHtml.replace('low stock', '<span style="color: #930a1f; font-style: italic;">low stock</span>');
            });            
            let Size = $("input[name='option1']:checked").val()
              ? $("input[name='option1']:checked").val()
              : $(".single-option-radio input[name='option1']").val();
            let Color = $(".js-colour-title").attr("data-colour");
            let quantity = $("input[name='quantity']").val();
            quantity = quantity ? quantity : 1;
            let variant;
            if (Color == undefined) {
              variant = meta?.product.variants.find(
                (item) => item.public_title === `${Size}`
              );
            } else {
              variant = meta?.product.variants.find(
                (item) =>
                  item.public_title === `${Size}` &&
                  item.name?.split("-")[1]?.trim()?.toLowerCase() ===
                    Color?.trim()?.toLowerCase()
              );
            }
            var resp = await shipmentMessageFun(variant?.id, quantity);
            message = resp.data.message ? resp.data.message : "";
            let tags = resp.data.tags;
            let tagType = resp.data.tagType;
            let key = resp.data.tagType == 1 ? "In Stock" : "Ships";
            if (message === "Out Of Stock") {
              $("#ship-msg").remove();
              $('button[name="add"]').prop("disabled", true);
            } else {
              $('button[name="add"]').prop("disabled", false);
              if ($(".free-ship-msg").find("#ship-msg").length > 0) {
                $(".free-ship-msg #ship-msg").text(`${key}: ${message}`);
                if(key === "In Stock") {
                  $("#ship-msg").removeClass('ships');
                  $("#ship-msg").addClass('in-stock');
                  $('.free-ship-msg .in-stock').html(function(index, oldHtml) {
                    return oldHtml.replace('low stock', '<span style="color: #930a1f; font-style: italic;">low stock</span>');
                  });
                } else {
                  $("#ship-msg").removeClass('in-stock');
                  $("#ship-msg").addClass('ships');
                }
              } else {
                $(".free-ship-msg").append(
                  `<div id="ship-msg">${key}: ${message}</div>`
                );
                if(key === "In Stock") {
                  $("#ship-msg").removeClass('ships');
                  $("#ship-msg").addClass('in-stock');
                  $('.free-ship-msg .in-stock').html(function(index, oldHtml) {
                    return oldHtml.replace('low stock', '<span style="color: #930a1f; font-style: italic;">low stock</span>');
                  });
                } else {
                  $("#ship-msg").removeClass('in-stock');
                  $("#ship-msg").addClass('ships');
                }
              }
            }
            // hideLoader();
            let inputField = `<input type="hidden" id="msg_from_api" name="properties[${key}]" value="${message}">`;
            let inputFieldHidden = `<input type="hidden" id="msg_from_apis" name="properties[_shipment]" value="${tags}%${tagType}">`;
            if ($("#msg_from_api").length > 0) {
              $("#msg_from_api").val(message);
              $("#msg_from_api").attr("name", `properties[${key}]`);
              $("#msg_from_apis").val(`${tags}%${tagType}`);
            } else {
              $("form[action='/cart/add']").append(inputField);
              $("form[action='/cart/add']").append(inputFieldHidden);
            }
          }
          // showLoader();
          apiResp();
          $.getJSON("/cart.js", function (res) {
            const isIdIncluded = res.items.some(item => item.id == window.location.search.split('variant=').pop());
            if(isIdIncluded){
              $('button[name="add"]').addClass("already-added-cart");
              $('button[name="add"]').text(`Already in cart`)
            }else {
              $('button[name="add"]').removeClass("already-added-cart")
              $('button[name="add"]').text(`ADD TO CART`)
            }
          })
          window.SLIDECART_CLOSED = function() {
            // Fires whenever Slide Cart has been closed
            $.getJSON("/cart.js", function (res) {
              const isIdIncluded = res.items.some(item => item.id == window.location.search.split('variant=').pop());
              console.log("isincluded===>",isIdIncluded)
              if(isIdIncluded){
                $('button[name="add"]').addClass("already-added-cart");
                $('button[name="add"]').text(`Already in cart`)
              } else {
                $('button[name="add"]').removeClass("already-added-cart")
                $('button[name="add"]').text(`ADD TO CART`)
              }
            })
          }  
          $('input[name="quantity"]').prop("disabled", true);
          $("input").click(function () {
            if ($(".custom-btn-cartt.btn-atc").text().trim() == "Sold Out") {
              $(".custom-btn-cartt.btn-atc").hide();
            }
            apiResp();
            $.getJSON("/cart.js", function (res) {
              const isIdIncluded = res.items.some(item => item.id == window.location.search.split('variant=').pop());
              if(isIdIncluded){
                $('button[name="add"]').addClass("already-added-cart");
                $('button[name="add"]').text(`Already in cart`)
              }else {
                $('button[name="add"]').removeClass("already-added-cart")
                $('button[name="add"]').text(`ADD TO CART`)
              }
            })
          });
          $("button").click(function () {
            apiResp();
          });
        });
      }, 3000);
    });
  });
})();
