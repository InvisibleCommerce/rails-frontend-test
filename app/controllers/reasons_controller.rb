class ReasonsController < ApplicationController
  def new
    @storefront = Storefront.find(params[:storefront_id])
    @reason = @storefront.reasons.new
  end

  def create
    @storefront = Storefront.find(params[:storefront_id])
    @reason = @storefront.reasons.new(reason_params)

    respond_to do |format|
      if @reason.save
        format.html { redirect_to edit_storefront_url(@reason.storefront), notice: 'Reason was successfully created.' }
        format.json { render :show, status: :created, location: @reason }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @reason.errors, status: :unprocessable_entity }
      end
    end
  end

  def edit
    @storefront = Storefront.find(params[:storefront_id])
    @reason = @storefront.reasons.find(params[:id])
  end

  def update
    @storefront = Storefront.find(params[:storefront_id])
    @reason = @storefront.reasons.find(params[:id])

    respond_to do |format|
      if @reason.update(reason_params)
        format.html { redirect_to [:edit, @storefront], notice: 'Reason was successfully updated.' }
        format.json { render :edit, status: :ok, location: @reason }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @reason.errors, status: :unprocessable_entity }
      end
    end
  end
end

private

def reason_params
  params.require(:reason).permit(:code, :label, :active, :ordering)
end
